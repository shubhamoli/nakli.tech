---
date: 2020-01-04T09:00:00Z
lastmod: 2020-01-04T09:00:00Z
author: Oli
title: Setup a 'sane' K8s cluster in local env using KinD
subtitle: 
feature: 
tags:
  - Containers
  - K8s
summary: 
---


&nbsp;


***Are you still using Minikube in 2020 to provision your local Kubernetes environment?***

Don’t you love the idea of having a multi-Node cluster for your local env too?

Idea of having Docker Containers as “Nodes”? Pre-installed binaries and tools to
test, debug and understand the wizardry of K8s.

If all of the above is intriguing you then we’re cool and ready to learn
more about this amazing tool called `KinD` (Kubernetes in Docker 😊).

Without much ado, let’s staaart!

&nbsp;

## Installation

On *NIX like machine:

```bash
$ curl -Lo ./kind https://github.com/kubernetes-sigs/kind/releases/download/v0.6.1/kind-$(uname)-amd64

$ chmod +x ./kind

$ mv ./kind /usr/local/bin/kind

$ kind version
kind v0.6.1 go1.13.4 darwin/amd64

```
For installation on other OSs and more [see this](https://kind.sigs.k8s.io/docs/user/quick-start/#installation)


&nbsp;

## Creating cluster

Creating cluster on KinD is as easy as `$ kind create cluster` but *wait!* don’t get
excited as this command will bootstrap the cluster using default settings
like single node cluster, "kind" as cluster’s context name, etc which we surely want to avoid if we
need a sane cluster.

**Trivia:** As we already know that `KinD` uses docker containers as “Nodes” therefore
by default it uses its custom [Node Image](https://kind.sigs.k8s.io/docs/design/node-image/) for creating “Nodes”.


```bash
# file: foo-bar-cluster-conf.yml

---
# HA 3 node control plane and 3 worker nodes cluster config

kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: control-plane
- role: control-plane
- role: worker
- role: worker
- role: worker


# Now, we'll create the cluster with custom context name and config
$ kind create cluster --name foo-bar --wait 2m --config foo-bar-cluster-conf.yml


# confirm that cluster is setup
$ kubectl get nodes
NAME                     STATUS   ROLES    AGE    VERSION
foo-bar-control-plane    Ready    master   105m   v1.16.3
foo-bar-control-plane2   Ready    master   104m   v1.16.3
foo-bar-control-plane3   Ready    master   103m   v1.16.3
foo-bar-worker           Ready    <none>   102m   v1.16.3
foo-bar-worker2          Ready    <none>   102m   v1.16.3
foo-bar-worker3          Ready    <none>   102m   v1.16.3
```

### Deploying app

If all goes well, then we will see that our cluster is setup properly. Now it’s time to
deploy apps onto this freshly created cluster. *Yay!, let’s do it.*


```bash
# pulling hello-kubernetes app from github
$ kubectl apply -f https://raw.githubusercontent.com/paulbouwer/hello-kubernetes/master/yaml/hello-kubernetes.yaml

# Check pods are running or not
$ kubectl get pods
NAME                                READY   STATUS    RESTARTS   AGE
hello-kubernetes-5655b546f8-ckw9w   1/1     Running   0          57s
hello-kubernetes-5655b546f8-mthl2   1/1     Running   0          57s
hello-kubernetes-5655b546f8-strxb   1/1     Running   0          57s

# All good, now confirm nodes on which pods are deployed (few columns are not shown)
$ kubectl get pods -o wide
NAME                                IP           NODE              
hello-kubernetes-5655b546f8-ckw9w   10.244.4.2   foo-bar-worker    
hello-kubernetes-5655b546f8-mthl2   10.244.3.2   foo-bar-worker2 
hello-kubernetes-5655b546f8-strxb   10.244.5.2   foo-bar-worker3
```

And it's done.


**Tip:** - To go inside a “Node” just do

`$ docker exec -it foo-bar-worker2 bash` and boom, you’re inside a worker node.

&nbsp;
&nbsp;

**Okay Okay, now this’s cool but what else `KinD` has to offer?**

Apart from setting up a multi-node cluster using Docker containers as “Nodes”,
which is something very cool *mind you*, `KinD` has few other things to offer as a tool.

After SSHing/entering in one of your nodes, it has several tools installed for
debugging and playing with Kubernetes itself such as `crictl`, `iptables-save`,
etc.  These binaries are installed by default which IMO are very much needed when you want to go
real deep into kubernetes, and curious to know how things are
working under the hood to provide you such a seamless orchestration.

To learn more about crictl see
https://kubernetes.io/docs/tasks/debug-application-cluster/crictl/ and same goes
for other kubernetes resources and tools.

Although, managing infrastructure using YMLs is new fad! but when it comes to
debugging an issue then shit goes real and you have to have these concepts known
to you beforehand in order to actually start a debugging session otherwise
you'll be lost.


## Conclusion

Although Minikube has served humanity very well ;-p, but `KinD` is superior
alternative to it for provisioning local k8s cluster with multi-node setup. IMO, Docker containers as
“Nodes” is itself a very creative idea and it also makes sense and seems quite sane to me in
the era where containers are first class citizens.

For complete documentation on `KinD` visit: https://kind.sigs.k8s.io/

Finally, to clean everything type `$ kind delete cluster`

#TillThenHappyCoding

