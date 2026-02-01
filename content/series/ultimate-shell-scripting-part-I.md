---
date: 2019-10-23T09:00:00Z
lastmod: 2019-10-23T09:00:00Z
author: Oli
title: Ultimate shell scripting cheatsheet - part 1
subtitle: 
feature: 
tags:
  - Shell
  - Linux
summary: 
---


&nbsp;


Shell and Shell scripting is unarguably one of the best asset of UNIX systems.
Yeah *prima facie*, it looks intimidating and old-school, this is all because it’s
almost the same for almost five decades now.

Let’s begin!

&nbsp;

## `#!/bin/sh` – Shebang

Almost all shell scripts out there have this weird looking line on the top the
file. What does this line even mean? is it a comment? or a superstition?

Actually, this line has a very significant meaning and it tells the absolute
path of the interpreter which is supposed to execute the script. This path can be
`/bin/bash` or `/bin/sh` for shell and `#!<path/to/python/bin>` for python scripts.

To find out your shell interpreter just `$ echo $SHELL` (inside terminal)
and to find your python interpreter you can use `$ which python` command.

The advantage is that — since *NIX systems don’t give special status to
extension of a file (like Windows does) and it all depends upon the content of
file and the program reading it. So this Shebang line declares the
interpreter/program on your behalf and you can avoid explicitly defining the
interpreter.

With shebang line on top, you can run your scripts directly like `$
./script.sh` (execute +x permission is required though) and it should work as expected.

**Note:** don’t hardcode `/bin/bash` as your shell because you will lose portability
across systems as `bash` is not the default shell in all systems, 
[OSX from Catalina has `zsh` as default shell.](https://www.theverge.com/2019/6/4/18651872/apple-macos-catalina-zsh-bash-shell-replacement-features)


&nbsp;

## Variables

Shell apart from being an interface to interact with the Kernel, it is also a
programming language and has the concept of variables. Let’s see them in action.

```
#!/bin/sh

foo=1                      # Notice no-spacing across '=' (strict)
bar=Hello                  # No quotes required for word
baz="Yo! I'm learning!"    # Quotes required for strings
bam=$foo                   # $ is required to access value

# variables can be assigned value 
# from output of a command
# but command needs to be wrapped in $() or backticks
ham=$(date +"%D %T")          
spam=`date +"%D %T"`

echo foo                  # output: foo
echo $foo                 # output: 1
echo '$bar'               # output: $bar (single quotes don't parse)
echo "$bar"               # output: Hello
echo "${bar}, World!"     # output: Hello, World!

# save this file as script.sh
# go to shell, mark file executable and then run

$ chmod +x script.sh
$ ./script.sh
```

&nbsp;


## Conditionals

Without conditionals any scripting is limited, there are rare situations in
real-world programs to be written without a single if-else statement (no switch
case blocks too). Shell scripting is also no exception here but its conditionals
are quite weird and might not be intuitive for beginners.

### if-else statement

```
#!/bin/sh

if [ condition ]; then    # see spacing around condition (strict)
  body
elif [ another-condition ]; then
  body
fi 

# Remember, we need to wrap variable with double quotes 
# so that its value can be parsed
if [ "$foo" = 5 ]; then        # Yes!, single '=' for comparison
    echo "Found"
else
    echo "Not Found"
fi

# using && operator
if [ "$foo" = 5 ] && [ "$bar" = hello ]; then 
    echo "Found"
else
    echo "Not Found"
fi

# comparisons
# since [ ... ] is same as "test" builtin hence
# it supports all operators which we use with "test"
if [ "$foo" -gt 4 ] && [ "$bar" -lt 5 ]; then 
    echo "Found"
else
    echo "Not Found"
fi

# Bash and few other shells support [[ ... ]]
# this is an enhanced version and more intuitive than [ ... ]
# but you may lose portability while using it
# as it is supported by few shells
# Also --
# No wrapping of variable, multiple condition in same block
# == operator for string comparator (lexical)
# support commands using $(...) too
if [[ $VAR_1 = 5 && $VAR_2 == hello ]]; then
    echo "Found"
else
    echo "Not Found"
fi
```

### case statement

Apart from if-else statements for conditionals, shell also offers elegant case
statement which you can somewhat relate to switch-case statements in General
programming languages. Although, it has no concept of default and break keyword
inside case

```
#!/bin/sh

# "case" stmt. is generally used for argument handling of scripts
case $1 in 
  full)             # if first argument of script is "full"
    init_full_backup     
    ;;
  incremental)      # if first argument is "incremental"
    init_incremental_backup
    ;;
  *)                # this is similar to "default" case in many langs.
    echo "Sorry, I don't understand"
    ;;
esac
```

&nbsp;

## Loops – for and while

Sometimes you need to iterate over some sequence or need to run a block of code
for certain number of times — What you do, you use loops. Like conditionals loops are
also integral part of any programming language.

```
#!/bin/sh

## 1. while loop
while [ condition ]; do  # will run until condition is falsy
   body
done

# somewhat more real world example
a=0
while [ "$a" -lt 5 ]; do
   echo $a
   if [ "$a" -eq 3 ]; then
      break         # conditional breaking out of loop
   fi
   a=`expr $a + 1`
done

## 2. for loop
for i in sequence; do
    body
done

# OR

for OUTPUT in $(Command-Here); do
    command on $OUTPUT
done

# somewhat more real world examples
for i in 1,2,3,4,5; do
   echo $i
done

for file in /tmp/*; do    
   [ -e "$file" ] || continue    # if file is empty, continue
   echo $file        # prints filename of all files inside /tmp
done

## Bash has some modern features to these loops

# like:
# 1. C/C++ style three-expression for-loop syntax
# 2. Ranges and steps {1..20..2} 1 to 20 with 2 step jump
```


Phew!, thanks a lot for bearing with me till here, that’s all for today. Let’s
conclude part 1 here and please practice as much as you can. No need to create
real world programs as of now, just play with scripting, do some random stuff
because learning with fun is never exhausting.

## Conclusion
As we know, Shell is an interface for us to talk to kernel and scripting helps
us to take this communication to next-level.

With programmable interface, you can automate your system administrative tasks
like backing up your Database periodically, notify you when your Disk usage
exceeds a certain threshold and much more.

If you want to be a true UNIX/Linux admin rather than a normal user you must
learn shell scripting and believe me you will never look back again.

See you in Part 2


#TillThenHappyCoding


