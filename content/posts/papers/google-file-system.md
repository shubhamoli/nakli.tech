+++
date = 2023-11-10T09:00:00Z
lastmod = 2023-11-10T09:00:00Z
author = "Oli"
title = "[Paper] The Google Filesystem - The TL;DR"
subtitle = ""
feature = ""
tags = ["tldr;", "papers"]
summary = ""
[toc]
  enable = true
+++

&nbsp;

Original Paper - https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf

The Google Filesystem (GFS) is a distributed file system which first came out in 2023. It providins fault tolerance while running on inexpensive consumer grade hardware. At the scale GFS being built on commodity hardware is based on the assumption that a component failure is a norm rather than an expection. Due assumption has led to observability and fault tolerance are integral to the system.

### Design considerations

- Being built on the commodity grade hardware, component failure is a norm rather than an exception. As a result continuous observability and fault tolerance are integral to the system
- Files are much bigger than traditional standards, so parameters such as I/O operations and block sizes have to be revisited
- Most files are mutated by appending new data rather than overwriting existing data.
- Co-designing the applications and the file system API. It benefits the overall system by increasing the flexibility.


### Interface

GFS provides a familiar, although not POSIX, interface to interact with the filesystem. The files are organised hierarchically in directories and identified by the path names. GFS supports usual CRUD operations on the files. Moreover, GFS also supports `snapshot` and `record append` operations.


### Architecture

A GFS cluster consists of single `master` and multiple `chunkservers`. The cluster is accessible to multiple clients at a time.

Files are divided into fixed-size chunks. Each chunk is identified by an immutable and globally unique 64 bit chunk handle assigned by the master at the time of chunk creation.

Chunkservers store chunks on local disks as Linux files and read or write chunkdata specified by a chunkhandle and the byte range. For reliability, each chunkis replicated on multiple chunkservers (default 3 replicas).

The master maintains all file system metadata. This includes the namespace, access control information, the mapping from files to chunks, and the current locations of chunks. It also controls system-wide activities such as chunklease management, garbage collection of orphaned chunks, and chunkmigration between chunkservers. The master periodically communicates with each chunkserver in `HeartBeat` messages to give it instructions and collect its state.

A GFS client library is responsible for the file system API and communicates with the master and chunkservers to read or write data on behalf of the application. Clients interact with the master for metadata operations, but all data-bearing communication goes directly to the chunkserver. GFS does not provide the POSIX API and therefore need not hookinto the Linux vnode layer.

Neither the client nor the chunkserver caches file data as data is usually large files. Clients do cache metadata. Chunkservers need not cache file data because chunks are stored as local files and so Linux’s buffer cache already keeps frequently accessed data in memory.

#### Single Master

Having a single global master makes design simple and easier to make decisions with global knowledge. Master is not used for read and write so that its involvement can be minimized and it cannot become a bottleneck.

A client asks master which chunkservers it should contact, it caches the information for a limited time and interacts with the chunkserver directly for many subsequent operations.

First using the fixed chunksize, the client
translates the file name and byte offset specified by the ap-
plication into a chunkindex within the file. Then, it sends
the master a request containing the file name and chunk
index. The master replies with the corresponding chunk
handle and locations of the replicas. The client caches this information using the file name and chuck index as the key. The client then sends a request to one of the replicas,
most likely the closest one. The request specifies the chunk
handle and a byte range within that chunk.

In fact, the client typically asks for multiple chunks in the
same request and the master can also include the informa-
tion for chunks immediately following those requested. This
extra information sidesteps several future client-master in-
teractions at practically no extra cost.

#### Chunk size

In the original GFS, the chunk size was chosen to be 64 MB. This is much larger than typical file system block sizes, but they consiouly chosen this number because it is well suited for Google's use case. Each chunk replica is stored as a linux file on a chunkserver. 

This large chunk size has few advantages:

- Fetch all required info in one network call
- Reduces the amount of metadata stored on the master.
- Once chunkserver info is available, maintain long running persistent TCP connection with the chunkserver

#### Metadata

The master stores three major types of metadata:

- The file and chunk namespace
- The maping from files to chunks
- Location of each chunkc's replicas

All metadata is kept in master's memory for faster access. Master maintains 64 bytes of metadata for each 64 MB chunk. The first two types are also kept persistent by logging mutations to an operation log stored on the master's local disk and replicated on remote machine.

##### Chunk locations

The master doesn't store chunk location information persistenly, intead it asks each chunkservers about its chunks at master startup and whenever a chunkserver joins the cluster. Master can keep itself upto date with regular `HeartBeat` messages.

This eliminated the problem of keeping the master and chunkservers in sync as chunkservers join and leave the cluster, change names, fail, restart, and so on. In a cluster with hundreds of servers, these events happen all too often.

Another way to understand this design decision is to real- ize that a chunkserver has the final word over what chunks it does or does not have on its own disks. There is no point in trying to maintain a consistent view of this information on the master because errors on a chunkserver may cause chunks to vanish spontaneously (e.g., a disk may go bad and be disabled) or an operator may rename a chunkserver.

##### Operation log

Operation log is a very critical historical record of metadata changes. It also acts as a logical timeline of the operations and therefore must be reliably stored and replicated in multiple machines.

Master much batch several log records before flushing thereby reducing the impact of flushing and replication on overall system throughput.

Master recovers its filesystem state by replaying the operation log. For faster recovery the log file should be kept small and master should keep checkpoints and only apply latest logs.

### Consistency Model

**Guarantees by GFS**

File namespace mutations are atomic and handled exclusively by Master. A file region is consistent if all clients see the same data regardless which replicas they see from.

A region is `defined` after a file data mutation is consistent and a mutation succeeds from the concurrent writes. A failed mutation makes a region unconsistent (and thus undefined) where many clients can be different data at different times. An application can distinguish between defined and undefined region.

Data mutations may be writes or record appends. A write causes data to be written at an application-specified file offset. A record append causes data (the “record”) to be appended atomically at least once even in the presence of concurrent mutations, but at an offset of GFS’s choosing.

After a sequence of successful mutations, the mutated file region is guaranteed to be defined and contain the data written by the last mutation. GFS achieves this by (a) applying mutations to a chunkin the same order on all its replicas and (b) using chunkversion numbers to detect any replica that has become stale because it has missed mutations while its chunkserver was down.

Stale replicas will never be involved in a mutation or given to clients asking the master for chunk locations. They are garbage collected at the earliest opportunity.

Since clients cache chunklocations, they may read from a stale replica before that information is refreshed. This win- dow is limited by the cache entry’s timeout and the next open of the file, which purges from the cache all chunkin- formation for that file. Moreover, as most of our files are append-only, a stale replica usually returns a premature end of chunkrather than outdated data. When a reader retries and contacts the master, it will immediately get cur- rent chunklocations.

Long after a successful mutation, component failures can of course still corrupt or destroy data. GFS identifies failed chunkservers by regular handshakes between master and all chunkservers and detects data corruption by checksumming.

A chunk is lost irreversibly only if all its replicas are lost before GFS can react, typically within minutes. Even in this case, it becomes unavailable, not corrupted: applications receive clear errors rather than corrupt data.

GFS applications can accommodate the relaxed consistency model with a few simple techniques already needed for other purposes: relying on appends rather than overwrites, checkpointing, and writing self-validating, self-identifying records

## System Interactions

We designed the system to minimize the master’s involvement in all operations. With that background, we now describe how the client, master, and chunkservers interact to implement data mutations, atomic record append, and snapshot.

### Leases and Mutations**

A mutation is an operation that changes the contents or metadata of a chunksuch as a write or an append operation. Each mutation is performed at all the chunk’s replicas. We use leases to maintain a consistent mutation order across replicas.

The master grants a chunklease to one of the replicas, which we call the primary. The primary picks a serial order for all mutations to the chunk. Thus, the global mutation order is defined first by the lease grant order chosen by the master, and within a lease by the serial numbers assigned by the primary.

The lease mechanism is designed to minimize management overhead at the master. A lease has an initial timeout of 60 seconds. However, as long as the chunkis being mutated, the primary can request and typically receive extensions from the master indefinitely. These extension requests and grants are piggybacked on the `HeartBeat` messages regularly exchanged between the master and all chunkservers.

The master may sometimes try to revoke a lease before it expires (e.g., when the master wants to disable mutations on a file that is being renamed). Even if the master loses communication with a primary, it can safely grant a new lease to another replica after the old lease expires.

- The client asks the master which chunkserver holds the current lease for the chunkand the locations of the other replicas. If no one has a lease, the master
grants one to a replica it chooses.
- The master replies with the identity of the primary and the locations of the other (secondary) replicas. The client caches this data for future mutations. It needs to contact the master again only when the primary becomes unreachable or replies that it no longer holds a lease.
- The client pushes the data to all the replicas. A client can do so in any order. Each chunkserver will store the data in an internal LRU buffer cache until the data is used or aged out. 
- Once all the replicas have acknowledged receiving the data, the client sends a write request to the primary. The request identifies the data pushed earlier to all of the replicas. The primary assigns consecutive serial numbers to all the mutations it receives, possibly from multiple clients, which provides the necessary serialization. 
- The primary forwards the write request to all secondary replicas. Each secondary replica applies mutations in the same serial number order assigned by the primary.
- The secondaries all reply to the primary indicating that they have completed the operation.
- The primary replies to the client. Any errors encountered at any of the replicas are reported to the client. In case of errors, the write may have succeeded at the primary and an arbitrary subset of the secondary replicas. (If it had failed at the primary, it would not have been assigned a serial number and forwarded.) The client request is considered to have failed, and the modified region is left in an inconsistent state. Our client code handles such errors by retrying the failed mutation.
- If a write by the application is large or straddles a chunk boundary, GFS client code breaks it down into multiple write operations. They all follow the control flow described above but may be interleaved with and overwritten by concurrent operations from other clients.


### Data Flow

We decouple the flow of data from the flow of control to use the network efficiently. To fully utilize each machine’s networkbandwidth, the
data is pushed linearly along a chain of chunkservers rather than distributed in some other topology (e.g., tree). Thus, each machine’s full outbound bandwidth is used to transfer the data as fast as possible rather than divided among multiple recipients.

To avoid network bottlenecks and high-latency links (e.g., inter-switch links are often both) as much as possible, each machine forwards the data to the “closest” machine in the networktopology that has not received it. 

### Atomic Record Appends

GFS provides an atomic append operation called record append. In a traditional write, the client specifies the offset at which data is to be written. Concurrent writes to the same region are not serializable: the region may end up containing data fragments from multiple clients. 

In a record append, however, the client specifies only the data. GFS appends it to the file at least once atomically (i.e., as one continuous sequence of bytes) at an offset of GFS’s choosing and returns that offset to the client.

This is similar to writing to a file opened in O APPEND mode in Unix without the race conditions when multiple writers do so concurrently.

Record append is heavily used by our distributed applications in which many clients on different machines append to the same file concurrently.

## Master Operation



