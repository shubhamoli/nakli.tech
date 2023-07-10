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


Struggle of switching between multiple GCP projects is actually real. In addition to that, making mistakes like running destrucutive commands in a wrong GCP project is also fairly common.

In this article, we will see how we can utilize `gcloud` configurations to seamlessly switch between GCP projects without going back and forth to the GCP console to fetch the project ids and other info.

**Note:** We can have multiple configurations for a GCP project with different properties/contexts. For the sake of this article I'll use the term *project* but that should not limit us only to the GCP projects.

&nbsp;

## Default configuration
When we install `gcloud` a `default` configuration is created for us and most engineers from this point don't bother to configure further. Most of them still always rely on copy/pasting project ids and other info. (I'll bet on your Notes app 😛) everytime when working with `gcloud`.

```sh
$ gcloud config configurations list
NAME         IS_ACTIVE  ACCOUNT            PROJECT           COMPUTE_DEFAULT_ZONE  COMPUTE_DEFAULT_REGION
default      True       oli@example.com


# and the usual gcloud command line would look like
$ gcloud compute ssh instance-001 \
     --project=oli-dev \
     --region=europe-west4 \
     --impersonate-service-account=${ADMIN_SA}
```

&nbsp;

## Multiple configurations
Good news is - `gcloud` supports multiple configurations (kinda similar to the `aws` profiles) which makes switching between GCP projects/contexts a seamless experience.

Let's see them in more detail:

&nbsp;
### Creating new configurations

```sh
# Create new configurations for our 3 envs
$ gcloud config configurations create dev
$ gcloud config configurations create staging
$ gcloud config configurations create prod
```

&nbsp;
### Activating a new configuration

Although the `create` command automatically activates the configuration it has just created, but in case we want to switch to a different one you can use the following command.

```
# The last one which got created was "prod"
# so currently "prod" is the active one
#
# let's switch to the "dev"
$ gcloud config configurations activate dev
Activated [dev]
```

&nbsp;
### Setting properties for the configurations

Now it's time to set some properties for each configuration which will set the context for a particular configuration.

Tip: To list all the supported properties, use this command `$ gcloud config list --all`

There are two approaches to set these properties:
1) Edit the configuration's file directly
2) Use `gcloud` CLI to update these values


**1. Edit the configuration file directly**

By default in the *nix systems all these configurations reside in `$HOME/.config/gcloud/configurations`.

```sh
$ cd ~/.config/gcloud/configurations
$ ls -l
drwxr-xr-x   6 Oli  staff  192 Jul 10 09:31 .
drwxr-xr-x  14 Oli  staff  448 Jul  7 13:04 ..
-rw-r--r--   1 Oli  staff   44 Jul  3 11:31 config_default
-rw-r--r--   1 Oli  staff    0 Jul  7 09:31 config_dev
-rw-r--r--   1 Oli  staff    0 Jul  7 09:31 config_staging
-rw-r--r--   1 Oli  staff    0 Jul  7 09:31 config_prod

```

We can directly edit these files and add some properties for these configurations in one go.

An example configuration might look like

```
[core]
account = oli@example.com
disable_usage_reporting = True
project = oli-dev

[auth]
impersonate_service_account = oli-dev-sa@oli-dev.iam.gserviceaccount.com

[compute]
region = europe-west4

[container]
cluster = cluster-001

```
Replace these properties with your values in your machine and you're good to go as soon as you save and quit.



**2. Use `gcloud` CLI to set the properties**

`gcloud` cli also offers feature to set/unset these properties using CLI commands.

```
# Make sure your desired configuration is activated
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

You can edit all other configurations in the similar way or even prepare a script to set these programmatically if you have 10s of projects to manage.

Once you're done, you need to re-login using `$ gcloud auth login`.

&nbsp;
### Switching between configuration

Finally after setting the properties, we are good to go now. To switch between GCP projects, we just need to activate the configuration for that particular project. Once done all the subsequent `gcloud` will use that configuration's properties as their context.

```sh
$ gcloud config configurations activate prod

# For ex. - use gcloud to SSH into the instance-001
# No need to specify --project and --region options
# as they will picked from the configuration
$ gcloud compute ssh instance-001

# Move to dev, it automatically deactivates the prod
$ gcloud config configurations activate dev
 
# Now for the SSH command
# project will be auto set to oli-dev
# and region will be auto set to the europe-west4 region
$ gcloud compute ssh instance-001
```

Apart from the above, most of the `gcloud` commands also support `--configuration=<name>`.

```sh
$ gcloud compute ssh instance-001 --configuration=dev
```

&nbsp;

## Bonus Tip #1
You can use tools like [direnv](https://direnv.net/) that will automtically set the appropriate ENV var as soon as you `cd` into a specific directory.

This is particularly useful when you have IaC directories for each environment.

```sh
$ tree gcp/
.
├── dev/
├── prod/
├── staging/

```

`direnv` setup would look like

```sh
$ cd dev/
$ touch .envrc
$ export CLOUDSDK_ACTIVE_CONFIG_NAME=dev
$ direnv allow .

$ cd ../prod/
$ touch .envrc
$ export CLOUDSDK_ACTIVE_CONFIG_NAME=prod
$ direnv allow .

```
Now as soon as you change the directories your `gcloud` configuration should automatically point to the correct one. `direnv` also unsets the env var as soon as you are out from a directory so you don't need to worry about if you are working in the right context anymore.

## Bonus Tip #2
Just for your convience, you can always print what's your current active configuration in your Shell promopt (or in the tmux's status bar). This will keep you always aware and might help you avoid executing destructive commands in a wrong project.

```sh
> PS1="$PS1 ($(echo $CLOUDSDK_ACTIVE_CONFIG_NAME)) "
> (dev) 
```

Add the above snippet in your `~/.bashrc` or `~/.bash_profile` to make it always available.

---

I believe we learned something new today which will definitely be a productivity booster for the daily users of `gcloud` and from now on they will be able to smoothly switch between multiple GCP contexts.


Till next time,

#Ciao #HappyHacking
