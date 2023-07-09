+++
date = 2023-07-09T09:00:00Z
lastmod = 2023-07-09T09:00:00Z
author = "Oli"
title = "Seamless switching b/w multiple projects using gcloud configurations"
subtitle = ""
feature = ""
tags = ["cloud", "gcloud", "cli"]
summary = ""
+++

&nbsp;

Struggling to switch between multiple GCP projects is actually real. In addition to that, making mistakes like running destrucutive commands in a wrong GCP projects is also fairly common.

In this article, we will see how we can utilize `gcloud` configurations to seamlessly switch between GCP projects (or GCP contexts in general) without going back and forth to the GCP console to fetch the project ids and other info.

&nbsp;

## Default configuration
When you install `gcloud` a default configuration is created for you and then most engineers don't bother to configure after this point and rely on copy/pasting project ids and other info (probably see your Mac's Notes app) when working with `gcloud`.

```sh
$ gcloud config list


# and the usual gcloud command line would like
$ gcloud compute ssh instance-001 \
     --project=oli-dev \
     --impersonate-service-account=oli-dev-sa@
```

&nbsp;

## Multiple configurations
Good news is - `gcloud` supports multiple configurations (kinda similar to the `aws` profiles) which makes switching between GCP projects/contexts a seamless experience.

Let's see them in more details:

&nbsp;
### Creating new configurations

```sh
$ gcloud config configurations create dev
$ gcloud config configurations create staging
$ gcloud config configurations create prod
```

&nbsp;

### Activating a new configuration

```
$ gcloud config configurations activate dev
```

&nbsp;
### Setting values for the configuration

Now, it's time to add approapriate properties for each configuration. By default in the *nix systems all these configurations reside in `$HOME/.config/gcloud/configurations`.

```sh
> cd ~/.config/gcloud/configurations
> ls -l
```

The good thing is we can directly edit these files and add some properties for these configurations in one go.

An example configuration might look like

```
[core]
account = oli@example.com
project = oli-dev-001
impersonate_service_account = oli-default-sa@oli-dev-001.iam.something.com
region = europe-west4

[compute]
zone = europe-west4-c

[container]
cluster_name = example-cluster
```
Replace these properties with your values in your machine.


&nbsp;
**OR**
&nbsp;

`gcloud` cli also offers features to add these properties using CLI and if you want you can set this values using this approach.

```
# Make sure your current new configuration is activated
$ gcloud config configurations activate dev
$ gcloud config set project `<project_id>`
$ gcloud config set compute/zone `<zone>`

# Now point to a new configuration
$ gcloud config configurations activate prod
$ gcloud config set project `<project_id>`
$ gcloud config set compute/zone `<zone>`

# you can even unset these properties
$ gcloud config unset project
```

You can edit all other configurations directly like this or ever probably like a script to generate these files if you have 10s of projects to manage.

&nbsp;
### Switching between configuration

Once one you to switch to an another GCP project, you need to activate the configuration for that particular project. Once you've activated a particular configuration, all subsequent `gcloud` will use that configuration's properties as their context.

```sh
$ gcloud config configurations activate prod

# For ex. - use gcloud to SSH into the instance-001
# project will be auto set to oli-prod
# and region will be auto set to the europe-west4 region
# means no need to specify --project and --region options
$ gcloud compute ssh instance-001

# Move to dev, it automatically deactivates the prod
$ gcloud config configurations activate dev
 
# Now for the SSH command
# project will be auto set to oli-dev
# and region will be auto set to the europe-west3 region
$ gcloud compute ssh instance-001
```

&nbsp;

## Bonus Tip #1
Just for your convience, you can always print what's your current active configuration in your Shell promopt (or in the tmux's status bar). This will keep you always aware and might help you avoid executing destructive commands in a wrong project.

```sh

```

## Bonus Tip #2
You can use tools like `direnv` that will set the following ENV var as soon as you `cd` into a specific directory.

This is particularly useful when you have IaC and other scripts segregated into directories assigned to a environment.

```sh
$ tree gcp/

```

`direnv` file would like

```sh

```

I believe we learned something new today which will definitely be a productivity booster for daily users of `gcloud` and from now on they will be able to smoothly switch between multiple GCP contexts.


Till next time,

#Ciao #HappyHacking
