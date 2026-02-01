---
date: 2020-08-30T09:00:00Z
lastmod: 2020-08-30T09:00:00Z
author: Oli
title: Why DNS primarily uses UDP if it is un-reliable?
subtitle: 
tags:
  - Networking
---

&nbsp; &nbsp;

When somebody asks what's the primary difference between TCP and UDP, they
often get the following copy-pasta as the answer:

###### UDP is connection-less and unreliable, whereas TCP is connection-oriented and highly-reliable protocol. Services which are required to be highly available should choose TCP over UDP. TCP offers congestion control, re-ordering of packets, ensuring delivery of packet . . .

But we all know that DNS (one the core and highly reliable services of the
Internet) primarily uses UDP.

&nbsp;

## How come DNS is so reliable if it uses UDP?

First of all, UDP is an "unreliable" protocol doesn't mean packets will be magically lost at
random, rather it implies that the protocol itself doesn't specify (unlike TCP) any formal mechanisms
for acknowledgements, retransmissions, packet re-ordering at end-hosts, error-correction, etc. 

Due to the absence of these above-mentioned features, UDP remains very light-weight, cheap on resources,
and extremely fast in terms of performance.

Higher-order application-level protocols and DNS-Clients, using UDP as their base, are required (and are free) to implement their
own coping mechanisms for packet losses, error correction, etc., rather than being forced to use one specified in the protocol
itself.

For DNS, UDP is an ideal choice because:

- **UDP is cheap and fast** which is the prime requirement for services like
  DNS

- DNS queries and replies are small and **fit in a single UDP packet** (under 512
  bytes). 
    - Being a single packet, receiving this packet itself implies acknowledgment 

    - and a single packet doesn't require any re-ordering mechanism

    - For a single packet no congestion control (offered by TCP) is required

- If a packet is lost or there is some delay in response (indistinguishable for
  UDP anyway) **retry mechanisms are implemented by DNS clients to get the answer**
  (either from same nameserver or from a different one if available).

- Since UDP header contains checksum so the integrity of the response packet can be
  easily verified


&nbsp;

## But wait, DNS does not always use UDP

- TCP is used when the response data size exceeds 512 bytes, or for tasks such as zone transfers.

- Some libraries use persistent DNS (over TCP) instead of UDP to send multiple queries at once for faster response and this reducing latency

- DNS over TLS (DoT) and DNS over HTTPS (DoH) which use TCP are already gaining traction. See
  [DNS Security extensions - DNSSEC](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions)

&nbsp;

## Takeaway

UDP is un-reliable doesn't mean that packets are randomly routed to black hole
rather it implies that the Protocol itself doesn't specify any mechanisms for
acknowledgement, re-transmission of lost packets, error correction, etc.

It's all upto application-level protocols (using UDP as base) to implement their
own coping mechanisms for ensuring the reliability of the system.

DNS Clients are examples of such applications which implement their own custom behaviours to handle
packet losses, retry mechanisms and therefore works very reliabily in
conjuction with UDP.

&nbsp; &nbsp;

#HappyNetworking #ItsDNSAgain



