+++
date = 2019-07-17T09:00:00Z
lastmod = 2019-07-17T09:00:00Z
author = "Oli"
title = "12-factor app methodologies and containerized environment"
subtitle = ""
feature = ""
tags = ["Containers", "Theory"]
summary = ""
[toc]
  enable = true
+++


&nbsp;

12-Factor app methodology has now become a de-facto standard for building
Software-as-a-service (SaaS) applications………


***But Wait!…..I don’t write SaaS apps, I’m a Software developer whose task is to
write services***. Just tell me how can I apply
these principles in my daily development tasks?


Okay Okay! no problem…….let’s see the original principles first and see what
each principle has to offer us for building modern cloud based web applications.

**Trivia:** The [original 12-factor app methodology](https://12factor.net/) was drafted by engineers at
Heroku and later on widely embraced by engineers around the globe.

**Note:** For this article we will consider Docker as default Container runtime and
kubernetes as default container orchestration tool.

So, let’s dive in.


&nbsp; 
&nbsp;

## 1. Codebase

**Original:** Each app should have it’s own single codebase and this codebase should
be tracked in Version Control systems like Git, subversion, etc. Although each
service can have any number of deployments or running instances.

If the codebase isn’t single then it is called a distributed system not an app
and directly violates 12-Factor app Methodology.

**Takeaway:** It is easier to build the Docker image from a single codebase for
deployment purposes. if your app spans over multiple codebases for a single
service then each codebase can itself act as a 12-Factor app. *Problem solved* 😊

&nbsp; 
&nbsp; 

## 2. Dependencies

**Original**: Each app should explicitly declare its dependencies and should not
rely on existence of system wide packages. These dependencies should be isolated
from system installed packages leveraging some kind of isolation environment.

**Lessons learnt:**

1. In containerised environment, each build starts with a fresh base image like
   alpine linux and we require some sort of declarative dependency management +
   Dockerfile to bundle things together and get our final image ready to deploy.

2. Explicitly declaring dependencies with correct version/tag (not `:latest`) also
   ensures consistency across different systems and environments.

&nbsp;
&nbsp;

## 3. Config 

**Original:** A config can be anything that varies between local, staging
   or production. environments. For ex, Database host IP, AWS credentials,
   Google API token, etc.

12-Factor method. suggests that config should be stored as environment
variables.

*Okay, I should practise this* as Docker Containers and Orchestration tools like
Kubernetes has in-built support to inject environment variables in containers at
run-time.

&nbsp;
&nbsp;

## 4. Backing Services 

A 12 factor app should treat Backing service like Databases,
   Memcache servers as attached resources and also a 12-factor app shouldn’t make
   any distinction between local and third-party resources. Furthermore, no
   change in codebase should be required when updating any of the backing
   services.

*Okay! I got this,* Due to ephemeral nature of containers, the backing services should
be treated as attached resources and service should work seamlessly even when
new container/instance of backing service rolls up and other one terminates.


&nbsp;
&nbsp;

## 5. Build, Release and Run 

**Original:** Strictly separate Build, Release and Run stages.

*Gotcha!*, Dynamic nature of containers needs this kind of separation of concern.
Image should be build and released with required config and run-time (or “run”
stage) should not be dependent on Build and release stages as an image can be
used to deploy infinite number of containers without building the image again.

&nbsp;
&nbsp;

## 6. Processes 

**Original:** Every app instance should be run in a separate stateless process
   and no data should be shared between them using local filesystem and memory.
   If any data needs to be persist it should be stored in a separate shared
   database.


*Oh! Finally,* When you scale out your service by running multiple instances under
a load balancer, you never expect that data stored in your local cache, memory
or disk is available to your app even for very next request. Therefore, you need
to write your code keeping statelessness in mind.


&nbsp;
&nbsp;

## 7. Port Binding 
**Original:** Export services via port binding. The twelve-factor
   app is completely self-contained and does not rely on runtime injection of a
   webserver into the execution environment to create a web-facing service. The
   web app exports HTTP as a service by binding to a port, and listening to
   requests coming in on that port.

*I know this, I know this* Docker and orchestration tools like Kubernetes
encourage this practice for exposing services and I already know this. Great! 🙂


&nbsp;
&nbsp;

## 8. Concurrency 

**Original:** Scale out via process model. In a 12-Factor app,
processes are first class citizen. The developer can architect their app to
handle diverse workloads by assigning each type of work to a process type.
For example, HTTP requests may be handled by a web process, and long-running
background tasks handled by a worker process.

But, but If your app is containerised then you don’t need to worry about this. This
is it.


&nbsp;
&nbsp;

## 9. Disposability 
**Original:** The twelve-factor app’s processes are disposable,
   meaning they can be started or stopped at a moment’s notice. This facilitates
   fast elastic scaling, rapid deployment of code or config changes, and
   robustness of production deploys. Processes should strive to minimize startup
   time and focus on Graceful shutdown.

*Again, I know this* If your app is managed by orchestration tools like
Kubernetes then you need not to worry about it, but still create your docker
images as light as possible for faster boot-up. For best practices see this


&nbsp;
&nbsp;

## 10. Dev/prod parity
**Original:** Keep development, staging, and production as similar as possible.

*My 2 Cents:* If you practice declarative style of deployments using Docker
containers and kubernetes. Dev prod parity can be achieved to a significant
level. And also, tools like docker-compose can help you to achieve parity to a
significant extent.


&nbsp;
&nbsp;

## 11. Logs 

**Original:** Treat logs as event streams. Logs are the stream of
    aggregated, time-ordered events collected from the output streams of all
    running processes and backing services. each running process writes its
    event stream, unbuffered, to stdout

*Oh! that’s why,* All log aggregators recommend to write your logs to stdout
instead of a file because you can’t track file names for each app or you have to
set some standard for naming log files. Also Docker has docker logs and
kubernetes has kubectl logs which display logs from containers’ stdout.


&nbsp;
&nbsp;

## 12. Admin processes 
**Original:** Run admin/management tasks as one-off processes.
    One-off admin processes should be run in an identical environment as the
    regular long-running processes of the app. Admin code must ship with
    application code to avoid synchronization issues.

*Again, Gotcha!*, Ephemeral containers with same image tag should be used to run
admin task. Another way is to use docker exec -it command to execute a command
directly inside the containers.

&nbsp;
&nbsp;


## Conclusion
12-Factor methodology may seem a set of guidelines for developing
SaaS applications but believe me they are the standard way to build any modern
web applications for scale. Nowadays, even many tools like Docker, Kubernetes,
etc are directly or in-directly built over these principles.


&nbsp;

#TillThenHappyCoding.
