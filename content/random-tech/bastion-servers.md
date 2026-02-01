+++
date = 2020-03-03T09:00:00Z
lastmod = 2020-03-03T09:00:00Z
author = "Oli"
title = "Bastion servers as frontline security for your infrastructure"
subtitle = ""
tags = ["Networking", "Security", "Infrastructure"]
feature = "testing"
[toc]
  enable = false
+++

&nbsp;
&nbsp;

**Disclaimer:** This article is in regards with cloud-native infrastructure which
means all machines, storage, network ACLs, firewalls, etc are virtually managed
and provided by a cloud provider on a shared-responsibility model.

As cloud admins we all know that, with ever growing cloud-based infrastructure,
it becomes tougher and tougher to reduce administrative access points and ensure
protection against unwanted and crooked visitors.

Therefore, it is highly recommended to introduce security concepts like Bastion
Servers, Firewalls, Private Subnets, VPN, ACLs, etc in your infrastructure as
early as possible. Since, covering all of these is beyond the scope of this
article so we’ll just focus on Bastion Servers this time.


&nbsp;

## What is a Bastion Server?

Bastion server is a intermediate host (for administrative entrypoints) between your private network and public
Internet. It acts as a frontline security for your infrastructure. 

Admins generally use bastion host as a proxy to access systems behind a protected network or a
firewall. Systems inside firewall can only be accessed (admin access) via
hopping through one of the Bastion hosts.

Since, Bastion servers reside in DMZ (demilitarized zone) or outside security
premises of your network therefore they requires special hardened configuration
so that they themselves can’t be broken.


**For instances to be used as Bastion host, It is recommended that:**

- The instance you use should be purpose-built and that you use it only as a bastion and not for anything else.
- Open only 22 port (SSH’s default port) and that too for trusted IP addresses only.
- Setup a logging server for SSH Access logs
- Always have more than one Bastion (ideally in each AZs)
- Enable SE linux for more tightened security
- Never store Private keys in Bastion Servers
- For more on OS hardening Click here


**How does Bastion hosts helped me?**

For me, I manage our infra. in AWS, and access to the administrative ports like
22 is disabled for public and it is only permitted from Bastion hosts.
Therefore, in our case bastion hosts are primarily used as a proxy for SSHing
into the instances in our VPC [in both public and private subnets].

And, also sometimes we use it as a tunnel to gain temporary access to ports
other than 22 without exposing them to any public network.


Integrating Bastion hosts – facilitates the following:

- Centralised and single source of truth for administrative accesses
- Especially, SSH access to the instances is only through Bastion hosts
- Easy to add/remove/manage SSH keys when a dev joins or leaves the organisation
- All instances except load balancers can be reside in private subnets
- Clean security group configuration for instances
- Easy to integrate with VPN, just restrict the access of Bastion hosts itself from the company’s VPN.


&nbsp;

## How to access instances through Bastion?


There are two methods:

### Without agent-forwarding

The idea here is that you copy your local machine’s public key in your bastion’s
authorized_key file and same goes for putting Bastion hosts public key in
authorized_key file of subsequent instances.

Note: Since OpenSSH 8.2/8.2p1 release Ed25519 algorithm is recommended over RSA

Then to SSH into a instance:

```bash
# 1. you first SSH into Bastion
$ ssh <user>@<bastion_public_ip>

# 2. and from Bastion server you hop into private instance
$ ssh <user>@<instance_A's_private_ip>
```


### With agent forwarding

Since, SSH is amazing!, and SSH also has a feature of agent-forwarding which
allows forwarding any private key from development machine to Bastion and
Bastion will use that private key to SSH into next instances.

With agent-forwarding you don’t have to explicitly put Bastion host’s key in
your Private instances and also you don’t have to put your .pem files in Bastion
Host.

This method is more commonly used when you create a fresh instance and you’re
accessing it for the first time to provision it using .pem file.


```bash
# 1. Start agent in background
$ eval "$(ssh-agent -s)"

# 2. Add your private key 
$ ssh-add -K /path/to/pem/file

# 3. Confirm whether key is added or not 
$ ssh-add -L

# 4. If all goes well, SSH into bastion with -A flag 
$ ssh -A <user>@<bastion_public_ip>

# 5. Then from bastion SSH hop into desired instance
$ ssh <user>@<instance_private_ip>
```

&nbsp;


## Conclusion

Till now, I think you would got a fair idea about What Bastion Hosts are and how
well they can act as frontline security for your infrastructure. Apart from
frontline security they also reduce the pain of controlling and managing
administrative access points to any private network behind a firewall.

&nbsp;
&nbsp;

#HopeItHelps  #TillThenHappyCoding

