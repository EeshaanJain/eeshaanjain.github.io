---
layout: post
title:  "Disjoint Sets"
date:   2021-07-03
excerpt: "This post is essentially a recap of Disjoint Sets"
image: "/images/graph.png"
usemathjax: true
---

## Operations in disjoint set

1. `Find(n)` : Finds the set to which n belongs. (Note that we choose an element of each set as parent, and the find operation returns that parent).
2. `Union(a, b)` : Merge 2 sets into a single one.

## Terminologies

1. Parent: A node which uniquely identifies a set.

## Implementation

We implement a disjoint set as follows : Say our disjoint set has 5 elements {1, 2, 3, 4, 5} and 2 is the parent. We implement pointers and for example say that

$$1 \to 3, \quad 4\to5, \quad 3\to2,\quad 5\to2,\quad 2\to 2 $$

This can be implemented by the array : {3, 2, 2, 5, 2} where the parent points to itself. The implementation (iteratively and recursively) is :-

```
Pseudo Code for find operation
find(n):
	while(1):
		if(n == parent[n]):
			return n
		else
			n = parent[n]
```

```
find(n):
	if(n == parent[n])
		return n
	else
		return find(parent[n])
```

To implement union:

```
union(a, b){
	a = find(a)
	b = find(b)
	if(a == b):
		return
	else
		parent[a] = b
}
```

## Implementation using negative parent

The implementation above could become difficult, hence what we do is initialize all values in parent to be -1, and whenever we union two nodes, we subtract from the parent, and keep positive value (parent node value) in parent[other] so that the negative value signifies the parent and abs(value) tells the size of that group.

For this, we implement the iterative find function

```cpp
find(a):
	while(parent[a] > 0):
        a = parent[a]
    return a
```

Using recursion

```cpp
find(a):
	if(parent[a] < 0)
        return a
    else
        return find(parent[a])
```

To get the union:

```
Union(a, b):
	parent[a] += parent[b]
	parent[b] = a
```

## Path Compression

It isn't hard to see that `find(n)` works in $$O(N)$$ time and thus becomes inefficient. 

Path compression is an algorithm to improve this time. It basically implements the disjoint set in the way that each node points to the main parent, instead of linking.

Iterative find function for this can be implemented in C++ as follows:

```cpp
find(a){
    vector<int> v;
    while(parent[a] > 0){
        v.push_back(a);
        a = parent[a];
    }
    for(int i = 0; i < v.size(); i++)
        parent[v[i]] = a;
    return a;
}
```

Recursively

```cpp
find(a){
    if(parent[a] < 0)
        return a
     return parent[a] = find(parent[a])
}
```

