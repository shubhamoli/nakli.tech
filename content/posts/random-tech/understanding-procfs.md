+++
date = 2019-11-04T09:00:00Z
lastmod = 2019-11-04T09:00:00Z
author = "Oli"
title = "Understanding procfs"
subtitle = ""
feature = ""
tags = ["Linux"]
summary = ""
+++


&nbsp;


`procfs` is a psuedo-filesystem present in many UNIX-like Operating systems.
It is used to access process related info without interacting with Kernel directly
(means no system calls). procfs is also a great example of one of the core UNIX
philosophy – *store data in flat files.*

It is called `proc` filesystem, hence the suffix *fs*, because it stores
information in a file/directory based hierarchy and by default is mounted on `/proc` mount point.


&nbsp; 
&nbsp; 
## It’s time to dig deeper

Although, almost all UNIX-like OSs have procfs but still we’re specifically
digging into Linux’s implementation. In Linux, each process has its own
sub-directory (named with Process ID) inside `/proc` directory. Let’s say if a
process has `PID 1337` then its information will be stored in `/proc/1337/`
directory.


**so let’s explore /proc/1337**

```bash
# # Note: This is not the entire tree, 
#         I've shown only a few files and directories 
#
$ tree /proc/1337
/proc/1337
├── cmdline
├── cwd -> /
├── environ
├── exe -> /bin/dbus-daemon
├── fd
│   ├── 0 -> /dev/null
│   ├── 1 -> /dev/null
│   ├── 2 -> /dev/null
├── fdinfo
│   ├── 0
│   ├── 1
│   ├── 2
├── gid_map
├── io
├── limits
├── map_files
│   ├── 400000-462000 -> /bin/dbus-daemon
│   ├── 661000-663000 -> /bin/dbus-daemon
│   ├── 7f7d069cd000-7f7d069d9000 -> /lib64/libnss_files-2.17.so
├── maps
├── net
├── ns/
├── root -> /
├── smaps
├── stat
├── status
├── task/
├── [tid]/
```


- **/proc/[pid]/cmdline** – this file contains the complete command line which is
  executed to start the program. For zombie processes, it is empty

- **/proc/[pid]/cwd** – this is the symlink to the current work directory of the
  process

- **/proc/[pid]/environ** – contents of this file is the list of null-byte (‘\0’)
  separated environment [variables] setup by the process

- **/proc/[pid]/exe** – a symlink to the original executable

- **/proc/[pid]/fd/** – this sub-directory contains one entry for each file, process
  has open. It is a symlink to actual files. 0 is for standard-input, 1 is for
  standard-output, 2 is for standard-error and others can be socket file
  descriptor etc.

- **/proc/[pid]/fdinfo/** – contains info of each open file descriptor

- **/proc/[pid]/uid_map,** /proc/[pid]/gid_map – these files expose the mappings for
  user and group IDs inside the user namespace for the process pid

- **/proc/[pid]/io** – contains the I/O stats of the process

- **/proc/[pid]/limits** – this file displays soft, hard limits for a process

- **/proc/[pid]/maps, /proc/[pid]/map_files** – A file containing the currently
  mapped memory regions, their access permission, start and end address pairs,
  etc.
  
- **/proc/[pid]/net** – all networking associated with the process can be found in
  this file

- **/proc/[pid]/ns/** – this is a subdirectory containing one entry for each
  namespace that supports being manipulated by setns

- **/proc/[pid]/root** – UNIX and Linux support the idea of a per-process root of
  the filesystem, set by the chroot system call.  This file is a symbolic link
  that points to the process’s root directory

- **/prod/[pid]/smaps** - This file shows memory consumption for each of the process's
  mappings. We can get an idea about the memory footprint of the process.

- **/proc/[pid]/stat** – contains the current stats of the process like its state
  (running, dead, zombie, etc), pid, ppid, start time, amount of time process
  has been scheduled, etc. It is used by ps utility

- **/proc/[pid]/status** – more human readable form of /proc/[pid]/stat

- **/proc/[pid]/task/** – contains subdirectory for each thread started by process
  and the file like hierarchy is same as /proc/[pid]

- **/proc/[pid]/[tid]/** – these subdirectories are not visible when iterating
  through /proc (and thus are not visible when one uses ls) but they contain
  numerical subdirectory for each running thread that is not a thread group
  leader and hierarchy is same as /proc/[pid]/task/[tid]


Now, let's see how we can information stored `/proc` directory to calculate total memory
being consumed by `php-fpm` workers.


```bash
# loop over all pids of fpm workers
# cat /proc/$pid/smaps
# sum memory usage and print 

$ for pid in $(pgrep php-fpm); do \
>          cat /proc/$pid/smaps; done | awk '/Pss/ {mem += $2} END {print mem, "kB"}'

123309kB
```

Apart from per-process information. `procfs` contains some very important
non-process level information too.

Some of them are:

- **/proc/sys/kernel/pid_max** – File contains the “number” representing the of
  maximum no. of processes your system can allow

- **/proc/cmdline** – Contains arguments passed to Kernel during boot time.

- **/proc/cpuinfo** – contains CPU info like vendor, cache size, CPU frequency, address
  size, for each core/processor of your CPU

- **/proc/filesystems** – filesystems supported by Kernel

- **/proc/loadavg** – The first three fields in this file are load average figures
  giving the number of jobs in the run queue. It is used by uptime to load
  average in last 1, 5, and 15 minutes

- **/proc/meminfo** – contains info of memory usage across system. It is used by
  free utility to display memory info

- **/proc/modules** – contains list of modules that have been loaded by the system

- **/proc/self** – This directory refers to the process accessing the /proc
  filesystem, and is identical to the /proc directory named by the process ID of
  the same process

&nbsp; 
&nbsp; 
## Conclusion

`procfs` is the dumping yard of Kernel for almost all process related information
and few of its content are used/parsed by various programs like `ps`, `free`, `htop`, etc
to make it more human-readable, and once we learn how to explore it manually we
can get more in-depth information about processes running in our system.

Go! explore the `/proc/[pid]` directory of any process to know more
about it and even more you can learn more about procfs from [procfs man page](http://man7.org/linux/man-pages/man5/proc.5.html).

&nbsp;

#TillThenHappyCoding

