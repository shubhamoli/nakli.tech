---
date: 2019-11-07T09:00:00Z
lastmod: 2019-11-07T09:00:00Z
author: Oli
title: Python collections module
subtitle: 
feature: 
tags:
  - Python
summary: 
---


&nbsp;


Python’s collections module is often ignored and sidelined by most of the python programmers
but it contains few useful container data types which can come handy in some
special scenarios and use-cases.


Let’s dig in!

As of writing, Wed 6 Nov 2019, and v3.8 — Python has total of 9 container Data types:

1. `namedtuple()`
2. `deque`
3. `ChainMap`
4. `Counter`
5. `defaultdict`
6. `OrderedDict`
7. `UserDict`
8. `UserList`
9. `UserString`


We’ll now see what each one has to offer and which use-case they satisfy.

&nbsp;

## namedtuple()

namedtuple() is actually a factory function to create `tuple` with named fields.
Since, there is no mention of private scope/properties/variables in Python’s
definition of OOPS (although we can enforce it to some extent using meta-classes
and `__setattr_` etc but still true immutability is missing). Now here comes
`namedtuple` which provides us the succinct way to create immutable attributes.

We can access our elements by either using tuple like numbered index or key
based lookup. It can be useful where we have a requirement to make class
attributes immutable.

```Python
>>> import collections
>>> Student = collections.namedtuple('Student', ['name','age']) 
>>>
>>> s = Student('Oli', '25')
>>>
>>> print(s[1])           # outputs 25
>>>
>>> print(s.name)         # Oli
>>>
>>> s.name = 'Shubham'    # AttributeError

```

&nbsp;

## deque

It is the implementation of “double-ended” queues in Python and is pronounced as
“deck”. It supports `append` and `pop` in order of `O(1)` in
either direction. If `maxlen` attribute is not specified or is `None`, deques may
grow to an arbitrary length. Once it is full, it will start discarding elements
from other end during an insertion.

Regarding its use-case we all know how and when `deques` are used.

```Python
>>> from collections import deque
>>>
>>> d = deque()            # make a new deque
>>> d.append('c')          # add a new entry to the right side
>>> d.appendleft('b')      # add a new entry to the left side
>>> d.appendleft('a')      # add a new entry to the left side
>>> d                      # show the representation of the deque
deque(['a', 'b', 'c'])
>>> d.pop()                # return and remove the rightmost item
'c'
>>> d.popleft()            # return and remove the leftmost item
'a'
>>> list(d)                # list the contents of the deque
['b']
>>> d[0]                   # peek at leftmost item
'b'
```

&nbsp;

## ChainMap

Sometimes, we need to override global values/config etc from a local config like
different `mysql` host for production and dev environment, in such situation we
can use `ChainMap`.

ChainMap is used to encapsulate multiple mappings as one view. In case of a
`key` present in multiple mappings then value of first dict passed will be taken into
account.

```Python
>>> import collections 
>>>
>>> local_env = {'MYSQL_HOST': 'localhost'}
>>> prod_env = {'MYSQL_HOST':  '172.30.X.X'}
>>>
>>> print(local_env['MYSQL_HOST'])
localhost
>>>
>>> final_env = collections.ChainMap(prod_env, local_env)
>>>
>>> print(final_env)
ChainMap({'MYSQL_HOST': '172.30.X.X'}, {'MYSQL_HOST': 'localhost'})
>>>
>>> print(final_env['MYSQL_HOST'])
172.30.X.X
>>>
```

&nbsp;

## Counter

This container data type is a subclass of dict and is used to store counts of
hash-able objects. It can come handy when you have to keep track of number of
occurrences of an element in an iterable (`str`, `list`, etc). For
missing/non-existent keys it returns 0 or '' instead of IndexError.

Example use-case, find numbers which appear more than once in a list.

```Python
>>> import collections
>>>
>>> l = ['a', 'b', 'a', 'b', 'a']
>>> counter = collections.Counter(l)
>>>
>>> print(counter['a'])       // 'a' occurs 3 times
3
>>> print(counter['b'])       // 'b' occurs 2 times
2
>>> print(counter.most_common(1))
[('a', 2)]
>>> counter['c'] += 1         // add 'c'
>>> print(counter['c'])
1
>>> print(c['xyz'])
```

&nbsp;

## OrderedDict

Although, fundamentally dict doesn’t need to have a definite order as we don’t
access elements using its position/index rather we use a `key` but still there are
possible use-cases when one need to preserve the order of insertion, therefore
comes this DataType called `OrderedDict` to satisfy this use case.

```Python
>>> import collections
>>>
>>> d = {}
>>>
>>> d['a'] = 1
>>> d['b'] = 2
>>> d['c'] = 3
>>>
>>> for k, v in d.items():
...    print(k, v)
...
a 1           # order is not same as order of insertion
c 3
b 2
>>> 
>>> od = collections.OrderedDict()
>>>
>>> od['a'] = 1
>>> od['b'] = 2
>>> od['c'] = 3
>>>
>>> for k, v in od.items():
...    print(k, v)
...
a 1           # YaY! order is same as order of insertion
b 2
c 3
```

&nbsp;

## defaultdict

Almost all of us have faced this `KeyError` while accessing non-existent keys in a
dict but fortunately `defaultdict` saves us from this notorious error and
return the mutually decided default value. `defaultdict` accepts a
function/factory as its argument to return the default value. Let’s see how it
works

```Python
>>> import collections
>>>
>>> dd = collections.defaultdict(lambda: 0)
>>>
>>> dd['a'] = 2
>>> dd['b'] = 3
>>>
>>> print(dd['a'])
2
>>> print(dd['x'])      # 'x' is non-existent
0
```

&nbsp;

## UserList, UserDict, and UserString

These Data types are subclass of standard `list`, `dict` and `str` class
respectively and act as wrapper around them. You can use them as base class for
your objects so that you can extend default behaviours and add new ones.


&nbsp;

## Conclusion

The collections module in Python is not very extensive or fancy, and also it
doesn't intend to satisfy every use case but still it can come very handy for
some particular use-cases where otherwise a developer would have to write a
custom and tricky workaround. 

Problems like immutable object attributes, keeping track of occurrences of elements in a list, 
maintain order in dicts, `O(1)` `append` and `pop` from both ends of a list, etc. are very common 
and therefore python has standard modules to handle them.

You can learn more about `collections` module in [official docs here](https://docs.python.org/3/library/collections.html) 
as each one of them have some cool methods to manipulate data which aren’t mentioned in this article.

&nbsp;

#TillThenHappyCoding
