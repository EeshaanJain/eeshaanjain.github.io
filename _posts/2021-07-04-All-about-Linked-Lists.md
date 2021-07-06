---
layout: post
title:  "All about Linked Lists"
date:   2021-07-04
excerpt: "This post is essentially a recap of Linked Lists"
image: "/images/graph.png"
usemathjax: true

---

## Introduction

Linked List is a linear data structure and not stored at a contiguous location.

Limitations of an array:

1. Fixed size (thus we must know the upper limit), and the memory allocated is equal to the upper limit irrespective of how much we use.
2. Inserting a new element is expensive ($$O(n)$$)

Linked Lists counters this by having dynamic size, and easy insertion/deletion. However it's drawbacks are:

1. Random access isn't allowed. We have to access elements sequentially starting from the first node. Also with default implementation, binary search can't be done.
2. Extra memory required to store pointer.
3. Not cache friendly as reference is localized.

Representation-wise the linked list is represented by a pointer to the first node of the linked list (first node is the head). Linked list is empty is equivalent to saying head is NULL. Each node has at least these two parts:

1. data
2. pointer to the next node

```cpp
class Node{
    public:
    	int data;
   		Node* next;
};
int main(){
    Node* head = NULL;
    Node* second = NULL;
    Node* third = NULL;
    head = new Node();
    second = new Node();
    third = new Node();
    head->data = 1;
    head->next = second;
    second->data = 2;
    second->next = third;
    third->data = 3;
    third->next = NULL;
}
```

The above code creates the linked list $$ 1 \to 2 \to 3$$. 

How to traverse the linked list? Consider we have created the above linked list. Let's write a function to traverse it.

```cpp
void traverseList(Node* n){
    while(n! = NULL){
        cout<< n->data <<" ";
        n = n->next;
    }
}
```

## Some operations on a linked list

### Insertion

We can add a node in one of three ways - at front, after a node, and at the end.

Case 1: Add a node to the front

Say we need to convert the linked list $$10 \to 15 \to 20\to25$$ to $$5\to10 \to 15 \to 20\to25$$. We can do so in $$O(1)$$ by changing the head pointer to point to the new node.

```cpp
void push(Node** head_ref, int new_data){
    Node* new_node = new Node(); // Create Node
    new_node->data = new_data; // Assign data
    new_node->next = (*head_ref); // Make new node point to the node where the old head was pointing
    (*head_ref) = new_node; // New node is the current head
}
```

Case 2: Add a node after a given node

```cpp
void insertAfter(Node* prev_node, int new_data){
    if(prev_node == NULL){ // If previous node is NULL, we can't 
        cout<<"Previous Node cannot be NULL";
        return;
    }
    Node* new_node = new Node(); // New node
    new_node->data = new_data; // Assign data;
    new_node->next = prev_node->next; // New node points to the node where the prev node was pointing
    prev_node->next = new_node; // Previous node points to the new node.
}
```

Case 3: Add a node to the end

```cpp
void append(Node** head_ref, int new_data){
    Node* new_node = new Node(); // new node
    Node *last = *head_ref; // Will be used later
    new_node->data = new_data; // Assign data
    new_node->next = NULL; // Since it's the last node, it points to NULL
    if(*head_ref == NULL){ // If the list is empty
        *head_ref = new_node; // Current node is the head
        return;
    }
    while(last->next != NULL) // Traverse the linked list
        last = last->next;
   	last->next = new_node; // When we get to the last node, assign it's next to the new node
    return;
}
```

Note that Case 1 and Case 2 work in $$O(1)$$ time, while Case 3 works in $$O(n)$$ time.

### Deletion

Given a key, we can delete the first occurrence in the linked list.

1. **Iterative Method** - to delete a node, we find the previous node, change its next and free the memory for the node to be deleted.

   ```cpp
   void deleteNode_iterative(Node** head_ref, int key){
       Node* temp = *head_ref; // Store temp
       Node *prev = NULL;
       // First we check if the head itself holds the key
       if(temp != NULL && temp->data == key){
           *head_ref = temp->next;
           delete temp;
           return;
       }
       // Else we need to search for the key to be deleted
       else{
           while(temp != NULL && temp->data != key){ // Traverse until we find the key
               prev = temp;
               temp = temp->next;
           }
           if(temp == NULL) // If we didn't find the key, then we essentially have traversed the entire list and temp became NULL
               return;
           prev->next = temp->next; // Set the previous node's next as the temp's next
           delete temp; // delete temp
       }
   }
   ```

2. **Recursive Method** - To delete a node recursively, we do the following steps:

   1. Pass Node* as a reference to the function
   2. Since the current node pointer is derived from the previous node's next, if the value of current node changes, so does the value of previous node's next, thus we can point previous node's next to current node's next.
   3. Find the node
   4. Store this node to deallocate later
   5. Change the node pointer so that it points to it next.

   ```cpp
   void deleteNode_recursive(Node* &head, int key){
       if(head == NULL){ // If head is NULL, we reached the end and didn't find they key
           cout<<"Element absent\n";
           return;
       }
       if(head->data == key){ // If the head itself has the key
           Node *temp = head; 
           head = head->next; // Make the head equate to the next
           delete temp; // Delete the head
           return;
       }
       deleteNode_recursive(head->next, key);  // Go to next node recursively
   }
   ```

Now let's see how to delete a node given a position, i.e given $$5\to10\to15\to20$$ and position 1, we need the final linked list to be $$5\to 15\to20$$.

```cpp
void deleteNode_byPosition(Node **head_ref, int pos){
    if(*head_ref == NULL) // Empty Linked List
        return;
    Node* temp = *head_ref; // Stroe head;
    if(pos == 0){ // If we need to delete head
        *head_ref = temp->next; // assign head to next
        free(temp); // delete head
        return;
    }
    for(int i = 0; temp != NULL && i < pos - 1; i++) // Find previous node
        temp = temp->next;
    if(temp == NULL || temp->next == NULL) // If pos > number of nodes
        return;
    // temp stores the previous node, thus we need to delete temp->next
    Node *next = temp->next->next; // Get the node after the one to be deleted
    free(temp->next); // Delete
    temp->next = next; // Assign the node next
}
```

Now let's delete the entire linked list

```cpp
void deleteList(Node **head_ref){	Node* current = *head_ref; // Get head    Node* next = NULL;    while(current != NULL){        next = current->next; // Get next node        free(current); // Free current        current = next; // Current  = Next    }    *head_ref = NULL; // Finally set head to NULL}
```

### Length

1. **Iterative Method** - 

   ```cpp
   int getCount_iterative(Node* head){    int count = 0; // Initialize count    Node* current = head; // Store head    while(current != NULL){ // Iterate through the linked list		count++;        current = current->next;    }    return count;}
   ```

2. **Recursive Method** - 

   ```cpp
   int getCount_recursive(Node* head){    if(head == NULL)        return 0; // Reached the end so return 0    else        return 1 + getCount_recursive(head->next); // Return 1 + size of linked list without head}
   ```

### Search

1. **Iterative Method** - 

   ```cpp
   bool search_iterative(Node* head, int x){    Node* current = head; // Set current to head    while(current != NULL){ // Iterate        if(current->data == x) // If found return true            return true;        current = current->next;    }    return false; // return false}
   ```

2. **Recursive Method** - 

   ```cpp
   bool search_recursive(Node* head, int x){    if(head == NULL)        return false;  // Base Case   	    if(head->data == x) // If found        return true;    return search_recursive(head->next, x); // Continue the search}
   ```

Similar to search is the method to get the $n^{th}$ node in the linked list

1. **Iterative Method** - 

   ```cpp
   int getNthNode_iterative(Node* head, int idx){    Node* current = head;    int count = 0; // current index    while(current != NULL){        if(count == idx)            return current->data; // If found return        count++;        current = current->next; // Else keep looking    }    assert(0); // If we didn't find element}
   ```

2. **Recursive Method** - 

   ```cpp
   int getNthNode_recursive(Node* head, int idx){	if(head == NULL) // If we reached the end, return -1        return -1;    if(idx == 0) // If its the head, return *head.data        return head->data;    return getNthNode_recursive(head->next, idx - 1); // Reduce the linked list and the index}
   ```

Another variation could be to find the $$n^{th}$$ node from the end of the linked list. 

1. Using length of linked list

   ```cpp
   int getNthNodeFromLast_length(Node* head, int n){    int len = getCount_iterative(head);    if(len < n)        return -1;    Node* temp = head;    for(int i = 1; i < len - n; i++)        temp = temp->next;    return temp->data;}
   ```

2. Using two pointers - we maintain a reference pointer and a main pointer. Initialize both to head, and move reference to n nodes from head. Now move both pointers one by one, until reference reaches the end and the main pointer will point to the $$n^{th}$$ node from the end.

   ```cpp
   int getNthNodeFromLast_twoPointers(Node* head, int n){    Node* main_ptr = head; // Main pointer    Node* ref_ptr = head; // Reference pointer    int count = 0;    if(head!=NULL){         while(count < n){            if(ref_ptr == NULL){ // If we reach NULL earlier, we don't have n nodes                cout<<n<<" is greater than linked list size\n";                return -1;            }            ref_ptr = ref_ptr->next;            count++;        }        if(ref_ptr == NULL){ // After that, if we reached NULL, then we can return early            head = head->next;             if(head != NULL) // Check if next isn't NULL                return main_ptr->data;        }        else{            while(ref_ptr != NULL){ // We move both pointers till we reach the end                main_ptr = main_ptr->next;                ref_ptr = ref_ptr->next;            }            return main_ptr->data;        }    }}
   ```

Another search variant could include printing the middle of a linked list. The middle is defined as follows - if the size is odd, middle is obvious, and for an even sized linked list it's the second middle element.

1. **Naive method** - We can get the size of the linked list and traverse it again to return the node at len/2. This is a two pass solution.

2. **Two Pointers** - In this method, we keep a track of two pointers, and one pointer moves by one, and other moves by 2. When the faster pointer reaches the end, the slower pointer will be at the middle element.

   ```cpp
   int getMiddle_twoPointers(Node* head){    Node* slow_ptr = head;    Node* fast_ptr = head;    if(head != NULL){		while(fast_ptr != NULL && fast_ptr->next != NULL){ // Fast pointer            fast_ptr = fast_ptr->next->next;            slow_ptr = slow_ptr->next;        }        return slow_ptr->data;    }}
   ```

3. **Slow Incrementing** - We traverse through the linked list maintaining a counter, and only increment it when our counter is odd.

   ```cpp
   int getMiddle_slowIncrements(Node* head){    int count = 0;    Node* temp = head;    while(head != NULL){        if(count & 1)            temp = temp->next; // Odd increments        ++count;        head = head->next;    }    if(temp != NULL)        return temp->data;}
   ```

Another variation of searching is to get the count of some value. This can be done in a single pass.

```cpp
int getValueCount_iterative(Node* head, int key){    Node* current = head;    int count = 0;    while(current != NULL){		if(current->data == key)            count++;         current = current->next;    }    return count;}
```

A similar recursive solution can be implemented. 

```cpp
int getValueCount_recursive(Node* head, int key){    if (head == NULL)        return 0;    if(head->data == key)        return 1 + getValueCount_recursive(head->next, key);    return getValueCount_recursive(head->next, key);}
```

### Loop Detection

It is possible for a linked list to have a loop. 

1. **Hashing Method** - We traverse the list and put the node addresses in a hash table. If at any point, NULL is reached we return false, and if current node points to any previously stored node, return true.

   ```cpp
   bool detectLoop_hashing(Node* h){    unordered_set<Node*> s;    while(h != NULL){        if(s.find(h) != s.end())            return true;       	s.insert(h);        h = h->next;    }    return false;}
   ```

2. **Modify Data Structure**

   ```cpp
   struct Node{    int data;    struct Node* next;    int flag; // flag tells if the node is visited or not}
   ```

3. **Floyd's Cycle-Finding algorithm** - 

   We traverse the list using two pointers, slow and fast. We move slow by 1, and fast by 2. If these pointers meet at the same node there is a loop and if they don't meet, there is no loop.

   ```cpp
   bool detectLoop_floyd(Node* list){    Node *slow_ptr = list, *fast_ptr = list;    while(slow_ptr && fast_ptr && fast_ptr->next){        slow_ptr = slow_ptr->next;        fast_ptr = fast_ptr->next->next;        if(slow_ptr == fast_ptr)            return true;    }    return false;}
   ```

4. **Mark visited without modifying DS** - 

   We create a temporary node and next pointer of each node that  is traveled points to this temp node. Hence we use the next pointer of a node as a flag.

   ```cpp
   bool detectLoop_tempNode(Node* head){    Node* temp = new Node();    while(head != NULL){        if(head->next == NULL) // When no loop            return false;            if(head->next == temp) // When already pointing            return true;        // If not pointing, then we make it point        Node *nex = head->next; // Store next        head->next = temp; // Point it to temp        head = nex; // Get next node	}    return false;}
   ```

5. **Reassign data** - Assign value of each data of node in the linked list to -1 

   ```cpp
   bool detectLoop_reassign(Node* head){    if(!head)        return 0; // Empty    else{        while(head){            if(head->key == -1)                return true;           	else{                head->key = -1;                head = head->next;            }        }        return false;    }}
   ```

Having talked about finding loops, let's find the length of a loop if it exists.

This can be done using the Floyd's cycle detection algorithm we saw. Whenever the two pointers meet, we call the point as the common point. We store this address, re-initialize counter, and revisit the nodes till we reach common point again.

```cpp
int countNodes(Node* n){    int res = 1;    Node* temp = n;    while(temp->next != n){        res++;        temp = temp->next;    }    return res;} int countNodesInLoop(Node* list){     Node* slow_ptr = list, *fast_ptr = list;     while(slow_ptr && fast_ptr && fast_ptr->next){         slow_ptr = slow_ptr->next;         fast_ptr = fast_ptr->next->next;         if(slow_ptr == fast_ptr)             return countNodes(slow_ptr);     }    return 0; }
```

