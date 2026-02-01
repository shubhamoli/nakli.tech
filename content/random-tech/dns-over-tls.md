+++
date = 2020-04-07T09:00:00Z
lastmod = 2020-04-07T09:00:00Z
author = "Oli"
title = "Encrypt DNS queries with DNS-over-TLS"
subtitle = ""
tags = ["Networking"]
+++

&nbsp;
&nbsp;

In May 2016, IETF proposed a new standard [[RFC 7858]](https://tools.ietf.org/html/rfc7858) 
for resolving DNS queries.
This new protocol defines how to resolve DNS queries over TLS a.k.a
DNS-over-TLS.

And, why not, [~60% of websites](https://w3techs.com/technologies/details/ce-httpsdefault) 
have been already migrated to HTTPS and, nowadays
with all major browsers forcing webmasters to adopt to HTTPS, this trend will
likely to see unexpected high. But DNS query resolution, one of the foremost
step, when communicating to a host over the Internet is always plain since the
advent in late 80s which as a consequence exposed it to many attacks.

&nbsp;

## What is DNS-over-TLS (DoT)?

DNS-over-TLS (DoT) is a security protocol to encrypt DNS queries in transit so
that nobody except end hosts can read them. As, TLS is used under-the-hood for
encrypting DNS questions and answers, eavesdropping of sensitive data or
man-in-the-middle attack (MITM attack) in general is easily avoided.

It works over TLS therefore relies on Public Key Infrastructure (PKI) to build
trust, ensure data integrity and data encryption with correct ciphers to
transfer data. To learn more on PKI see this and to learn more about TLS read
RFC 2246 and RFC 2346.

Many public resolvers like Cloudflare, Google, Quad9 are already supporting DNS
resolution over TLS but being a relatively new standard the transition is not so
smooth as the clients (except browsers) have to migrate their setup from non-TLS
to DNS-over-TLS.

Meanwhile, If a client can’t update their stack quickly due to some reason then
it can use a Proxy service to route non-TLS DNS questions to DNS-over-TLS. One
such project related to this is [Stubby](https://github.com/getdnsapi/stubby) which routes your non-TLS to
DNS-over-TLS. Stubby can run as a daemon in your machine and act as a stub resolver.


{{< figure src="/images/dns-over-tls-proxy.png" title="DNS-over-TLS Proxy" >}}


&nbsp;

## DNS-over-HTTPS (DoH)

Another alternate protocol to secure DNS resolution is DNS-over-HTTPS (DoH)
which is already integrated in latest versions of Firefox browser [Read Here for
more]

**Isn’t HTTPS also uses TLS under the hood? Why a separate standard?**

Yes, you are right, it definitely uses TLS for identification and encryption but
the minor detail here to note is that – *DoH is designed to disguise DNS queries
by transporting them over generic https port 443.*

What this means is instead of resolving queries over dedicated port (853 for
DNS-over-TLS) where every passing traffic is for-sure a DNS question/answer DoH
intermingles DNS queries with generic traffic and due to which certain exploits
specific to DNS resolution can be avoided easily.

Yeah, DoH has already received much criticism from many people pioneer in this
domain. So, we should stop the discussion right here 🙂


&nbsp;

## Conclusion

When DNS initially came into picture in late 80s, Internet was small and
security was not a major concern due to which DNS queries are always resolved in
plain sight for the past 3 decades. But sooner or later IETF realised this and
with DNSSEC they created few standards to secure the transfer of this sensitive
information.

Several protocols were designed and one of them is DNS-over-TLS which encrypts
DNS queries in transit and helps in mitigating Man-in-the-middle attack. It uses
already a proven standard, TLS and PKI, to achieve what is desired.

Although, all major public resolvers are already supporting DNS-over-TLS but
clients have to update themselves for a major transition. Several Browsers are
also doing their part to integrate the protocol and one such example is
integration of DNS-over-HTTPS (DoH) by firefox browser.

&nbsp;

#StaySafe #HappyCoding
