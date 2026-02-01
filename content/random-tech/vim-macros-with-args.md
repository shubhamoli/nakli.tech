---
date: 2023-02-19T09:00:00Z
lastmod: 2023-03-12T09:00:00Z
author: Oli
title: [TIL] Vim macros in conjuction with the arglist
subtitle: 
tags:
  - Vim
  - TIL
---

&nbsp;
&nbsp;

Recently I was involved in a housekeeping task where we had to update versions of some dependencies in 80+ services and I came across a pretty cool way to achieve that using Vim idioms.

I already use Vim macros a lot on the daily basis but this was my first time I used them in conjuction with the `:args` and felt it's worth sharing.

&nbsp;

First, let's understand the mentioned terms.

**Vim Macros**

> In Vim, the word "macro" may refer to:  
A sequence of commands recorded to a [register](https://www.brianstorti.com/vim-registers/)


**Arg list**
> Args list is a set of files you specify before you run a command on those files. Unlike buffer list which is a list of all open files, in the Arg list files can be selectively added.

&nbsp;

## Writing the Macro
So the macro which I needed to write for my task was:

```
<Esc>                             // enter normal mode
qa                                // start recording macro in register "a"
:%s/2022/2023                     // update copyright header
:%s/v0.7.9/v0.8.0                 // update version
:%s/perms\/v0.9.0/perms\/1.0.0    // another module update
q                                 // stop recording.
```
&nbsp;

Now in order to run this macro in all `.tf` files, let's load them in the arglist.

```
:args **/.tf      // load .tf file to the argslist
:args             // view arglist
:argdo norm @a    // run macro stored in register "a" on all files in the arglist
:argdo update     // save all changes
```
&nbsp;

Once it's done, time to view our `git diff`.

```git
$ git status
...
...
index 83ba5f1..47ea517 100644
--- a/main.tf
+++ b/main.tf
@@ -1,4 +1,4 @@
-/* Copyright (C) 2022 FooBar - All Rights Reserved
+/* Copyright (C) 2023 FooBar - All Rights Reserved
@@ -8,9 +8,9 @@
  */

 module "foo" {
-  source  = "git::https://example.com/vpc.git?ref=refs/heads/branch-name?ref=v0.7.9"
+  source  = "git::https://example.com/vpc.git?ref=refs/heads/branch-name?ref=v0.8.0"
 }

 module "bar" {
-  source  = "git::https://example.com/vpc.git?ref=refs/heads/branch-name?ref=perms/v0.9.0¨
+  source  = "git::https://example.com/vpc.git?ref=refs/heads/branch-name?ref=perms/v1.0.0¨
 }

...
...
--- a/gke/main.tf
+++ b/gke/main.tf
@@ -1,4 +1,4 @@
-/* Copyright (C) 2022 FooBar - All Rights Reserved
+/* Copyright (C) 2023 FooBar - All Rights Reserved
@@ -8,9 +8,9 @@
  */

 module "foo" {
-  source  = "git::https://example.com/vpc.git?ref=refs/heads/branch-name?ref=v0.7.9"
+  source  = "git::https://example.com/vpc.git?ref=refs/heads/branch-name?ref=v0.8.0"
 }

```

&nbsp;

Voila!, it worked 🙌

&nbsp;

### P.S.
Like everything else there are N number of ways to achieve what I just did with the combination of `:args` and Macros but this was my TIL moment, I really like the potential of it and felt worth sharing it.


&nbsp;
&nbsp;

--

**Ciao**
