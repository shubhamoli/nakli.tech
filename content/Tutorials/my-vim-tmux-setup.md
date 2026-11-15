---
date: 2020-01-18T09:00:00Z
lastmod: 2020-01-18T09:00:00Z
author: Oli
title: My vim+tmux based Terminal workflow
subtitle: 
feature: 
tags:
  - Vim
  - Tmux
  - Linux
summary: 
---

**Trivia:** It’s been 5 months since I’ve embraced Vim as my full-time IDE and ditched VSCode finally.

Being a DevOps engineer and Cloud Admin, I spend a lot of time inside my
Terminal; sometimes tailing logs, running playbooks, debugging Networking
issues, and I had always used Vim for past 4 years to make small changes on
remote machines.

![My Terminal screenshot](/images/terminal-screenshot.png)

**My dotfiles:** https://github.com/shubhamoli/dotfiles

### Why Vim? just for the sake of “Showing off” my nerdy side or I’m genuinely interested.

I’ve always heard that Vim is powerful, extensible and the last editor you’ll
ever need. And, like everyone else I was also intimidated at first by its slow
learning curve and to be honest I was afraid of re-wiring by muscle memory as
it’s not easy to get out of your comfort zone.

Vim keybindings and modes are dope! *hands down*, but as they say – Rome wasn’t built in a
single day, similarly getting cool with Vim keybindings requires your time to
invest in. Once you are comfortable then it’s not just text-editing anymore
it becomes a lifestyle.

As I was already using Vim for a few years so finally in September 2019 I
decided to dive deeper and *hallelujah!*, configured my Vim, to suit my needs and
transformed it as my full-time IDE and never looked back again.

**What to do to feel at-home with Vim? after learning how to quit Vim 😛**

As this is not a detailed Vim tutorial in any sense — following is my approach
which I used while going deeper into Vim and you can also follow this too to
not get frustrated by so called “grumpy” Vim.

**#1** Change some default settings to make Vim more fancy like

```
// file:  ~/.vimrc

set nocompatible                     " no compatibility with old vi
filetype plugin indent on            " enables "detection", "plugin" and "indent"
syntax enable                        " syntax highlighting based on filetype
set relativenumber                   " line numbers (relative to cursor) on
set ttyfast                          " enable for modern terminals
set hidden                           " allow switching buffers without saving
set backspace=2                      " let backspace behave like backspace
set backspace=indent,eol,start
set clipboard=unnamed                " map system clipboard with Vim's
set incsearch                        " show match as you type
set autoident                        " autoident using VIM default settings
set ignorecase smartcase             " case-insensitive search
set tabstop=4 shiftwidth=4           " set your tab width
set expandtab                        " convert tabs to spaces
set encoding=UTF-8                   " encoding to utf-8
set t_Co=256                         " enable 256-colors
set termguicolors                    " enable true colors support

// Install a plugin manager
You can have a look at VimPlug: https://github.com/junegunn/vim-plug

```

**#2** Map your `Caps` key to `Esc` key, so that switching between modes becomes very
easy. Your left pinky is perfect for switching between modes. And, who uses
`Caps` anyway.

**#3** Disable Arrow keys completely. Yes! do it now, it’ll force you to learn Vim’s
motion keys

```
noremap <Up> <Nop>
noremap <Down> <Nop>
noremap <Left> <Nop>
noremap <Right> <Nop>
noremap! <Down> <Nop>
noremap! <Left> <Nop>
noremap! <Right> <Nop>
noremap! <Up> <Nop>
```

**#4** You can always use `j`, `k` (also see #5) for moving vertically but always
prefer word-wise movements (`w`, `W`, `b`, `B`) over character based (`h` and `l`) to move
horizontally in a line.

**#5** OR, use `(` and `{` to move through sentences and paragraphs and `[m` and `]m` to
move method/function to method.

**#6** Best it to use `f<x>` to find a character in a line (ex. `f=` to move cursor to assignment
operator) and then start moving word by word.

**#7** use `ci(` or `ci"` to change inside a parenthesis or quote (great for
programmers). The idea here is to learn more about text-objects

**#8** Use Following Plugins from day one

```
Plug 'scrooloose/nerdtree'
Plug 'vim-airline/vim-airline'
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'kien/ctrlp.vim'
Plug 'jiangmiao/auto-pairs'
Plug 'tpope/vim-surround'
```

**#9** Install an Auto-Complete engine like `YouCompleteMe` or `CoC.nvim` so that it
Vim can get some IntelliSense and you can get less tense

**#10** Visit VimAwesome (https://vimawesome.com/) for exhaustive list of Vim
Plugins.

**Important:** Search for “Vim dotfiles Github” on Google and Watch videos related
to Vim on YouTube to learn more about how other experience devs have customised their Vim and
also to know more about the capabilities of Vim and to know upto which extent you can
customize it.

**Most Important:** How un-easy it feels to point your fingers on the right keys.
#Justdoit but please do not revert to your previous IDE or editor — it takes
time to establish new muscle memory.

**Note:** Always remember your Vim is only yours. Take inspiration from everyone
but decide on your own like which key and mapping is most suitable for you. In
my case, `/` is very accessible instead of `,` key (which many vimmers prefer as
their `<Leader>` key) that’s why I have mapped `/` as my `<Leader>`.

## Why tmux?

Vim is super, it provides amazing text-editing experience out-of-the-box but in
real-world software development we have to have some grunt tasks running in
parallel (like web server, tests, build tools, watchers, etc) and also a
developer usually works on multiple projects/repos at a time, so this is where
Tmux comes into play to make this context-switching more efficient.

Tmux (stands for “terminal multiplexer”) is a utility which enables number of
pseudo-terminals to be created, managed and accessed from a single screen.

Both, Vim and Tmux, have the concept of splits or panes, so in conjunction they 
work so cohesively like you’ll never feel like using two entirely different
programs.

For example – You can have a workflow with dedicated tmux session for each project
you’re working on and then in each tmux session you can have multiple windows with
Vim, web-server, tests, build tools, etc running in context of that project.
Switching between sessions and windows is just a matter of pressing a HotKey.

With https://github.com/christoomey/vim-tmux-navigator (highly recommended
plugin for both Vim and tmux) movement between panes and windows created by Vim
and tmux gets very seamless, and it makes the workflow smooth like an IDE.

Many people ask me – iTerm2 does that too, then why tmux? The reason for
preferring tmux over iTerm2 is that iTerm2 is not available for Linux which
means it’s not ubiquitous and secondly tmux is again highly customisable like
Vim.

**For the ending Note:** Although, Vim keybindings and tmux intergration is
definitely worth experiencing but all I can say is never include Vim and Tmux in your
workflow for the sake of it or by getting neurotically obsessed and please do
it whence you feel that it’s right time to switch. 

***Remember, never switch to Vim when you’ve deadlines to meet*** 😉

#JustForChange #HappyLearning
