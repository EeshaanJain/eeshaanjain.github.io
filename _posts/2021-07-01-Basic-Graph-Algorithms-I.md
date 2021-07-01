---
layout: post
title:  "Basic Graph Algorithms - I"
date:   2021-07-01
excerpt: "This post is essentially a recap of basic graph theory algorithms and their implementations in C++."
image: "/images/graph.png"
usemathjax: true
---

# Basic Graph Algorithms - I

This post is essentially a recap of basic graph theory algorithms and their implementations in C++.

## Representation of Graphs

We will stick to the adjacency list representation of a graph, and not the adjacency matrix method (which takes up $$O(N^2)$$ space and DFS/BFS on it take $$O(N^2)$$ time).

The adjacency list method stores a list for each node, containing the directed edges starting from that node to an element in the list. For example, the DAG: $$1 \to 2 \to 3$$

the adjacency list is:

```
1: 2
2: 3
```

For the undirected graph: $$1 - 2 - 3$$

the adjacency list is:

```
1: 2
2: 1, 3
3: 2
```

## Depth-First Search

Depth First Search finds the lexicographical first path in the graph from a source vertex u to each vertex. Depth First Search will also find the shortest paths in a tree (because there only exists one simple path), but on general graphs this is not the case. Given N vertices and M edges, the algorithm works in $$O(N+M)$$ time. The idea behind DFS is to go as deep into the graph as possible, and backtrack once you are at a vertex without any unvisited adjacent vertices.

### Code

```cpp
vector<int> ar[N+1]; // Adjacency list
vector<bool> vis(N+1, false); // visited array
void dfs(int node){
    vis[node] = true;
    for(int child: ar[node]){
        if(!vis[child])
            dfs(child);
    }
}
```

### Applications

1. Find any path in the graph from source vertex u to all vertices.
2. Find lexicographical first path in the graph from source u to all vertices.
3. Check if a vertex in a tree is an ancestor of some other vertex.
4. Find the lowest common ancestor (LCA) of two vertices.
5. Topological Sorting
6. Check whether a given graph is acyclic and find cycles in a graph.
7. Find strongly connected components in a directed graph.
8. Find bridges in an undirected graph.

## Edge Terminologies

Let's denote the nodes by u and v, and the edges by (u, v). 

- If v is not visited

  - *Tree Edge:* If v is visited after u, then (u, v) is called a tree edge. Simply, if v is visited for the first time and u is currently being visited, (u, v) is the tree edge. These edges form a DFS tree

- If v is visited before u

  - *Back Edge:* If v is an ancestor of u, the (u, v) is a back edge. v is an ancestor if we have entered v but not exited it yet. Back edges create a cycle.
  - *Forward Edge:* If v is a descendant of u then (u, v) is a forward edge, i.e if we already visited and exited v and entry[u] < entry[v], then (u, v) is a forward edge.
  - *Cross Edge:* If v is neither an ancestor nor a descendent of u, then (u, v) is a cross edge. It is different from above as entry[u] > entry[v] in this case.

  *Forward* and *Cross* edges exist only in directed graphs.

## Counting Connected Components in an Undirected Graph

A set of nodes belong to a connected component (will be referred to as CC from now on), if for any 2 nodes in CC, there exist a path from one to the other.

A notion of strongly connected components (SCC) come up in a directed graph. A SCC is a subset 𝒞 of vertices such that for any 2 vertices in 𝒞, there exists a path between them, i.e for u, v belonging to 𝒞, there exists the edge u -> v and v -> u.

If there are no isolated nodes in a directed graph, then if we convert all directed edges to undirected edges, we get a single CC called the weakly CC of the directed graph.

To count the number of CC using DFS, we can make a simple observation:

> If we choose any node in a CC to begin DFS, all nodes in that CC will get traversed. Hence, we can use the aid of the `vis` array we implemented before to simply count the number of CC

```cpp
vector<int> ar[N+1]; // Adjacency list
vector<bool> vis(N+1, false); // visited array
void dfs(int node){
    vis[node] = true;
    for(int child: ar[node]){
        if(!vis[child])
            dfs(child);
    }
}
int main(){
    /*
    Create adjacency list (skipped)
    */
    int count = 0; // Number of CC
    for(int i = 1; i <= N; i++){
        if(vis[i] == 0){
            dfs(i);
            count++; // Number of DFS calls from main denote the number of CC
        }
        
    }
}
```

## Single Source Shortest Path (SSSP) on Trees

(Note that this approach won't work on general graphs)

Given a tree, we can use DFS to get the SSSP. For this, we maintain another array called `dist` which maintains the distances of the vertices from the root node (and the root node itself has a distance of 0). Each child call will have the distance as one more than the parent.

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1);
vector<int> dis(N+1);

void dfs(int node, int distance){
    vis[v] = 1;
    dis[v] = distance;
    for(int child: ar[node]){
        if(vis[child] == 0)
            dfs(child, distance+1);
    }
}

```

## Bipartite Graph

A bipartite graph is a special graph such that you can divide the vertex set into 2 disjoint sets such that:

- Each vertex belongs to exactly one of the two sets
- Each edge connects vertices of 2 different sets

With this definition, it is not difficult to note that all graphs with even cycles are bipartite (if you can't figure out why, just try a square graph with all vertices connected by the edge of the square).

This problem is also referred to as the 2-coloring problem and each edge connects vertices of different color. Our task is given a graph, check if it is bipartite.

This again, can be done using DFS. We maintain a color array, which contains the color of the vertex, and each call we set the color of the unvisited child as the opposite of the color of the parent, and if the node is visited, we check if the color is opposite. If it isn't we can just return as the graph isn't bipartite.

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1);
vector<int> col(N+1); // color array

bool dfs(int v, int c){
    vis[v] = 1;
    col[v] = c; // set color
    for(int child: ar[v]){
        if(vis[child] == 0){ // If the child isn't visited
            if(dfs(child, 1^c) == false) // Set color as opposite and see if the check (see below) fails for any of their children. If it does, return false
                return false;
        }
        else{
            if(col[v] == col[child]) // Check if for any visited vertex, the edge connects same colored vertices. If it does, return false
                return false;
        }
    }
    return true; // if everything passed, return true
}
```

## Cycle Detection in Undirected Graph

For an undirected graph, it is simple to detect cycles using DFS. 

> We use the fact that if $$\exists$$ a back edge, then the graph has a cycle.

To check for back edge, we see that for any of the children of a vertex v, if any vertex is visited which isn't the parent, then the edge must be a back edge. Using this fact, we can implement it as follows:

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1);
bool dfs(int v, int parent){
    vis[v] = 1;
    for(int child: ar[v]){
        if(vis[child] == 0){
            if(dfs(child, v) == true) // This is again for an early return
                return true;
        }
        else{
            if(child != parent) // If the vertex is visited, but is not the parent, then we have a child - ancestor matching and thus a back edge.
                return true;
        }
    }
    return false;
}
```

## In-Out Time of Nodes

For any vertex, it's *in* time is defined as the count (in a discrete timer) when it's first visited, and it's *out* time is defined as the time it is exited (during backtracking). It is obvious that for any node v, $$in[v] < out[v]$$. Implementing this is straightforward as when we enter the DFS call, we set the in time, and when we leave the call, we set the out time.

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1), in(N+1), out(N+1);
int timer = 1;
void dfs(int v){
    vis[v] = 1;
    in[v] = timer++; // Set in time
    for(int child: ar[v]){
        if(vis[child] == 0)
            dfs(child);
        
    }
    out[v] = timer++; // Set out time
}
```

## Diameter of a Tree

The diameter of a tree is defined as the longest path between two nodes in the tree. A naive approach to find the diameter is to run DFS n times, and each time keep note of the max distance in the `dist` array. But this approach is $$O(N^2)$$ and we can do better. In fact it is only needed to run DFS twice!

We choose an arbitrary node, and find the farthest node from it (say we started from u and found node v to be the farthest). Now, we run DFS again from node v, and find the furthest node, and this distance is the diameter. Why is this so? Prove it yourself :)

## Subtree Size

Given a tree, the task is to find the subtree size for all nodes. This can be done using DFS again. Each call of DFS keeps track of the current size of the tree, and we can recursively get all the sizes. The implementation is shown below

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1), subTreeSize(N+1); // keeps track of the subtree sizes

int dfs(int v){
    vis[v] = 1;
    int curr_size = 1; // initialize current subtree size as 1
    for(int child: ar[v]){
        if(vis[child] == 0) // If not visited, visit it
            curr_size += dfs(child); // Increment the subtree size of child to parent
        
    }
    subTreeSize[v] = curr_size; // After exiting, we can store the subtree size
    return curr_size;
}
// Note that the function will return the tree size of the root node to the main, and the array subTreeSize contains the rest of the subtree sizes.

```

## Breadth-First Search

The path found by breadth first search to any node is the shortest path to that node, i.e the path that contains the smallest number of edges in unweighted graphs. The algorithm works again in $$O(N+M)$$ time.

The algorithm takes as input an unweighted graph and the id of the source vertex s. The input graph can be directed or undirected, it does not matter to the algorithm. The algorithm can be understood as a fire spreading on the graph: at the zeroth step only the source s is on fire. At each step, the fire burning at each vertex spreads to all of its neighbors. In one iteration of the algorithm, the "ring of fire" is expanded in width by one unit (hence the name of the algorithm).

BFS is implemented using a queue containing the vertices and the `vis` array. We loop until the queue is empty, and in each iteration, pop a vertex from the front of the queue. Iterate through all the edges going out of this vertex and if some of these edges go to vertices that are not already visited, place them in the queue.

### Code

We will implement SSSP using BFS here

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1);
vector<int> dis(N+1);

void BFS(int src){
    queue<int> q; // Queue 
    vis[src] = 1; // Source is visited
    dis[src] = 0; // Sourse has distance 0
    q.push(src); // Push the source to the queue

    while(!q.empty()){ // Loop till q is empty
        int curr = q.front(); // Pop the front element
        q.pop();
        for(int child: ar[curr]){ // Loop over all children of the current node
            if(vis[child] == 0){ // If not visited, update dis, vis and push it
                q.push(child);
                dis[child] = dis[curr] + 1;
                vis[child] = 1;
            }
        }
    }
}
```

### Applications

1. Find the shortest path from a source to other vertices in an unweighted graph.
2. Find all connected components in an undirected graph in $$O(N+M)$$ time.
3. Finding a solution to a problem or a game with the least number of moves.
4. Finding the shortest path in a graph with weights 0 or 1 (0 - 1 BFS).
5. Finding the shortest cycle in a directed unweighted graph.
6. Find all the edges that lie on any shortest path between a given pair of vertices.
7. Find all the vertices on any shortest path between a given pair of vertices.
8. Find the shortest path of even length from a source vertex s to a target vertex t in an unweighted graph.

## DFS Tree

DFS tree one of the most useful techniques for solving structural problems about graphs. When we traverse a tree via DFS, we go visit some edges, and we don't visit some. The back edges aren't visited. The tree formed by the visited edges is called the DFS Tree.

## Finding Bridges

Bridges or cut edges are those edges which when removes make the graph disconnected, or more precisely, increase the number of CC. Along with `vis` and `in` array, we maintain a `low` array (referred to as the low-link value). For a node u, its LLV is the lowest in time of node reachable from node u. This `low` array is initialized to the same value as the `in` array, but in the course of traversal, faces some operations:

- If the child of node v is already visited, then `low[v] = min(low[v], in[child])`
- If the child isn't visited, we visit it and the node v is a bridge if $$low(child) > in(v)$$. 
- After the call, we set `low[v] = min(low[v], low[child])`

Hence, as a summary:

$$low[v] = \min\begin{cases} in[v]& \\ in[p]&\text{for those $p$ for which $(v,p)$ is a back-edge}\\low[to]&\text{for those $to$ for which $(v, to)$ is a tree-edge}\end{cases}$$

```cpp
vector<int> ar[N+1];
vector<int> vis(N+1);
vector<int> low(N+1), in(N+1);
int timer = 0;

void dfs(int v, int parent){
    vis[v] = 1;
    low[v] = in[v] = timer; // Set low[v] = in[v] = timer
    timer++; // Increment timer

    for(int child: ar[v]){
        if(child == parent) // Continue in this case
            continue;
        if(vis[child] == 1) // If visited, low[v] = min(low[v], in[child])
            low[v] = min(low[v], in[child]);
        else{
            dfs(child, v); // If not visited, visit it
            if(low[child] > in[v]) // If low[child] > in[v], then we have a bridge
                cout<<"BRIDGE: "<<v<<" -> "<<child<<endl;
            low[v] = min(low[v], low[child]); // low[v] = min(low[v], low[child])
        }
    }
}
```





