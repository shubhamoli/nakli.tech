---
date: 2020-07-19T09:00:00Z
lastmod: 2020-07-19T09:00:00Z
author: Oli
title: Writing a bloom filter in go
subtitle: 
tags:
  - Data Structures
  - Tutorials
feature: 
maxShownLines: 300
---


&nbsp;
&nbsp;


### Let's assume you're assigned a task to implement a feature which will check whether a username is already taken or not.

**You:** *Sounds easy.* 

Most probably your first intuitive approach will be to check for username availabilty in your database everytime a new
user tries to signup. Right?

**Manager:** Good, but does this going to scale well? can we make it more efficient?

Somehow we have to minimize:
- DB search
- Network calls

**You:** Perfect, I know a data structure highly appropriate for these kind of
problems and it is known as Bloom Filter.

*<FeelingProudOfYourself.gif>* 


&nbsp;

## OKay, What is a Bloom Filter?

Bloom filter is a probalistic Data Structure designed by Burton Howard Bloom in
1970. It is primarily used for answering set membership queries *i.e.,* check if an element **x**
is present in a set **S** or not. 

Although *prima facie* it's use-case seems similar to hash tables (fast lookup) but it is very space
efficient than conventional hash tables and therefore preferred in low core memory scenarios.

It is probalistic in nature as it may return false positives. If bloom filter
says an element is not present then we can be 100% sure that it's not ***but*** for any
positive response, the element may or may not be present in the set and in this
case we have to query our primary source (may be DB) for final confirmation.

One may argue that we're stil end up calling our primary source for the final
confirmation then what's the benefit, but let me tell you that with proper configuration
(using mathematics) we can reduce these calls to a huge extent (almost negligible).

For calculating optimal value of `m` and `k` from total no. of elements `n` and
error rate `e` see formula in the program below or see [here](https://en.wikipedia.org/wiki/Bloom_filter#Optimal_number_of_hash_functions)

While risking false positives, bloom filter has substantial space advantage over
other Data Structures like hash tables, tries, binary search trees, etc. bacause these DS
store the element itself which can require small no. of bits (for ints) to
arbitrary large no. of bits (for strings). Bloom filter doesn't store element at
all and a separate solution like a DB should be used to store actual element.

**Important:** *A Bloom filter with a `1%` error and an optimal value of `k`, in contrast, requires
only about `9.6 bits` per element, regardless of the size of the elements*


&nbsp;

## Data Structure

Bloom filter is a bit vector of **m** bits where initially all bits are set to
`0`. It also has **k** (`k` < < `m`) hash functions where each of them maps or hashes some set element to
one of the **m** array positions.



&nbsp;

### Algorithm

&nbsp;

{{< figure src="/images/bloom-init.png" width="100%" title="bloom-filter at init" >}}

&nbsp;

**To add an element:**
- Pass element through `k` hash functions to get `k` indices (`k < < m`).
- Set bit at these indices to **1**.


{{< figure src="/images/bloom-add.png" width="100%" title="" >}}

&nbsp; 

**To check set membership of an element**
- Pass element through `k` hash functions to get `k` indices
- Check bit at these indices, if any bit is **0** then immediately return `false`.
- If all bits are **1**, then return `true` but remember this may be a false positive and we
  have to confirm its presence with primary source which in our case is our DB.


{{< figure src="/images/bloom-false.png" width="100%" title="Key does not exist (100% surity)" >}}

&nbsp;

{{< figure src="/images/bloom-query.png" width="100%" title="key may or may not exist" >}}

&nbsp;

**Why false positives?**

With time, and even with highly uniform hashing algorithm, most of indices will be `1`
and if when we now query an element then the probablity of returning all `1s` will be
high.


For ex:
- `foo` set bits at index `1`, `3`, and `5`
- `bar` set bits at index `2`, `4`, `6`
- Now, we want to check for `baz` but our bit vector is now almost full of
  `1s` and `baz` maps to indices `2`, `5`, and `6` which are all `1s` but
  we know that `baz` was never present in the set and hence it's a false positive as these bits weren't set by `baz`
  itself.


But with proper configuration using mathematics this situation can be avoided easily.



&nbsp;

## Program in golang


```
// package bloom implements a very simple bloom filter
//
// Simple here means:
// - fixed length
// - elements can't be removed
// - not production ready in any sense
package bloom


// Word about external packages used
//
// 1. BitSet is not availble in standard go library so I've to import
//	  third-party library or as an alternative can use go's "big" package as bitset
//
// 2. murmur3 algorithm is used because it has best trade-off between
//    speed and uniformity
//	  inspired by this answer: https://stackoverflow.com/a/40343867

import (
	"fmt"
	"math"

	"github.com/spaolacci/murmur3"
	"github.com/willf/bitset"
)


type BloomFilter struct {
	m		uint				// size of bit vector
	k		uint				// no. of hash functions to use
	b		*bitset.BitSet		// bit vector
}


// Add an element to set
func (bf *BloomFilter) Add(key string) {
	data := []byte(key)

	// generate k index to set
	// using k hash functions
	for i := uint(0); i < bf.k; i++ {
		// find hash with seed value "i"
		// so that each time we get diff hash
		v1, _ := murmur3.Sum128WithSeed(data, uint32(i))
		// normalise to 0...m-1
		index := v1 % uint64(bf.m)
		// set bit at idex to 1
		bf.b.Set(uint(index))
	}
}

// query an element against set
func (bf *BloomFilter) Contains(key string) (bool) {
	data := []byte(key)

	for i := uint(0); i < bf.k; i++ {
		v1, _ := murmur3.Sum128WithSeed(data, uint32(i))
		// normalize to 0...m-1
		index := v1 % uint64(bf.m)
		// if any bit is found 0
		// return false immediately
		if ! bf.b.Test(uint(index)) {
			return false
		}
	}

	// Otherwise return true
	// Remeber: element may be false positive
	return true
}


// for formula: see wikipedia page of bloom filter
//
// and you can verify here
// https://www.di-mgt.com.au/bloom-calculator.html
// https://hur.st/bloomfilter/
func calcM(n uint, e float64) (uint) {
	tmp := - ((float64(n) * (math.Log(e))) / float64(math.Pow(math.Log(2), 2)))
	return uint(math.Ceil(tmp))
}


// for formula: see wikipedia page of bloom filter
//
// and you can verify here
// https://www.di-mgt.com.au/bloom-calculator.html
// https://hur.st/bloomfilter/
func calcK(e float64) (uint) {
	return uint(math.Ceil(-1 * math.Log2(e)))
}


// Initialise and return bloom filter
func Init(n uint, e float64) *BloomFilter {
	fmt.Printf("Info :: Creating BloomFilter for %d elements, with %.2f error rate\n", n, e)

	m := calcM(n, e)
	k := calcK(e)

	fmt.Printf("Info :: Required m and k are %d, %d \n", uint(m), k)

	// create bitset of size m and return BloomFilter
	return &BloomFilter{m, k, bitset.New(m)}

}



```


### Driver Program

```
package main

import (
	"bloom-filter/bloom"
	"fmt"
)


// Driver program
func main() {
    // create a bloom filter to store 10000 usernames
    // with false positive tolerance to 1%
	usernameStore := bloom.Init(1000, 0.01)

	usernameStore.Add("foo")
	usernameStore.Add("bar")
	usernameStore.Add("baz")

	fmt.Printf("%t\n", usernameStore.Contains("foo"))				// true
	fmt.Printf("%t\n", usernameStore.Contains("ishouldbefalse"))	// false
	fmt.Printf("%t\n", usernameStore.Contains("metoo"))				// false
	fmt.Printf("%t\n", usernameStore.Contains("bar"))				// true
	fmt.Printf("%t\n", usernameStore.Contains("idon'tbelonghere"))	// false
	fmt.Printf("%t\n", usernameStore.Contains("foo"))				// true

}

```



## Conclusion

So, that was our attempt to implement a very simple bloom filter from scratch in golang.

Simple bloom filters are just the start. Bloom filter serve for variety of use-case and more advanced versions of it are being
used at low latency large scale environments. 

Some of the products using bloom filters are:

- Akamai uses bloom filters to avoid "one-hit wonders"
- Medium relies on bloom filters to avoid recommending articles user has previously
  read
- Chrome used to use them to protect users from opening malicious sites
- Many DBs use them to avoid disk lookups for non-existent rows and columns
- Ethereum uses Bloom filters for quickly finding logs on the Ethereum blockchain
- and infinitely more use-cases and applications.


To learn more about bloom filters in details see it's [Wikipedia
page](https://en.wikipedia.org/wiki/Bloom_filter)

And, for math behind bloom filters, [see this](http://pages.cs.wisc.edu/~cao/papers/summary-cache/node8.html)

&nbsp;

#TillThenHappyCoding
