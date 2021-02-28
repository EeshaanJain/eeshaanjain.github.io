---
layout: post
title:  "What exactly is a neural network?"
date:   2021-02-13
excerpt: "An introduction to deep learning via the roots."
image: "/images/neural_network.png"
usemathjax: true
mermaid: true
---


You might have heard words such as "Neurons", "Neural Nets", but what exactly are those? To understand that, lets first dive into the biological neuron.
<figure>  
<img src="https://cdn1.byjus.com/wp-content/uploads/2020/02/STRUCTURE-OF-NEURON.png"  alt="Trulli"  style="width:100%">  
<figcaption>Fig.1 - Biological Neuron</figcaption>  
</figure>
The dendrites receive signals, the soma processes the signals and finally the axon transmits the output of this neuron. The point of connection to other neurons is called the synapse (nerve endings). We can summarise the processes as follows :
<center>
<div class="mermaid">
graph LR;
Input-->B[Some<br>Processing];
B-->Output
</div>
</center>
Now this might be highly inaccurate biologically, but we can (on a high-level) summarize the process inside our brains this way.
Now, it isn't right to say a single neuron does all the work! There exists a huge network of neurons (around $$10^{11}$$) which function in our brain, and are connected to each other in a complex manner.  When our body receives a stimulus, the neurons fire up and start sending the signal in a hierarchial fashion, with the information being passed across "several layers" of neurons, with some receiving them and some not. Each neuron gets an input (which is the output of the previous neuron), does some processing and gives an output passed to the next neuron. We can see a small example of a few neurons to show this :
<center>
<div class="mermaid">
graph LR;
subgraph Layer 1
A[IP1]-->B[Process];
B-->C[OP1]
end
subgraph Layer 2
C-->D[IP2]
C-->E[IP3]
C-->F[IP4]
D-->G[Process]
E-->H[Process]
F-->I[Process]
G-->J[OP2]
H-->K[OP3]
I-->L[OP4]
end
subgraph Layer 3
J-->M[IP5]
J-->N[IP6]
J-->O[IP7]
J-->Q[IP9]
K-->M
K-->O
K-->P[IP8]
L-->M
L-->N
L-->P
L-->Q[IP9]
end
</div>
</center>
We can see how even starting from a single neuron in the first layer, things get messed up quickly. We have just used 9 neurons as of now, imagine the same with $$ 10^{11}$$!
It is not necessary that all the neurons get activated together. There can be conditional activation of neurons, and along with parallelism of the huge network, every neuron doesn't need to do everything :thinking:. Each layer has a separate role to play, and all layers together complete a certain task.
Now, lets get back to the topic. We as humans have immense capability to learn various things - how to correct grammar, how to distinguish images to state some. Based on our understanding of this biological process, can we somehow replicate it? Or in other words - create an *artificial* version of the same? Thinking on the same path, the very first step towards the artificial neuron was taken by Warren McCulloch and Walter Pitts in 1943 inspired by neurobiology.
<center>
<div class="mermaid">
graph LR;
A[x1] --> B((Neuron))
C[x2] -->B
D[x3] -->B
F[..] -->B
G[xn] -->B
B-->E[y]
</div>
</center>
We take some inputs : $$x_1, x_2 \cdots x_n \in \{0,1\}$$ and pass it to the neuron. The neuron does some processing and based on that, returns the output $${y} \in \{0,1\}$$. So how does the MP Neuron does its processing?
First, it sums the boolean inputs, i.e computes <center>$$g(x_1,x_2\cdots x_n) = \sum_i^n x_i$$</center> Then, a threshold value $b$ is set, and the output y is given as <center>$$y = \begin{cases} 1 \text{ if } g(\textbf{x}) \geq b \\ 0 \text{ if } g(\textbf{x}) < b\end{cases}$$</center>
You might be thinking - the data available to us isn't boolean. For example, the temperature of the air at a certain place is a float such as $$13.2 ^\circ$C or $$41.8^\circ$$C. Well, one way to overcome this problem (so that we can use the MP Neuron) is to say the following
```
if temp > 25
	put y = 1
else
	put y = 0
```
This would generate out boolean inputs (although later you will see we will work with float values too!)
<blockquote><b>Task 1:</b> Using the above definition of the MP Neuron, generate the boolean functions : 2 input AND, 3 input OR, NOT, TAUTOLOGY. How do you geometrically interpret the first 2 functions?</blockquote>

<hr/>

Now, lets start the learning aspect of this neuron. The general goal of a supervised learning network is to predict a $$\hat{f}$$ which maps the input to the output most accurately. So how do we measure the accuracy? How do we know that our model is good or bad? For that we define a loss function, and try to minimize it. We'll get into that in a bit, but what are we trying to learn here?
In the case of the MP Neuron, we have only 1 unknown parameter $$``b"$$ and our goal is to find the best $b$ to describe the task.  Hence, we learn the value of $$b$$. (Though it is not at all necessary that our data follows a linear pattern. We are trying to fit a linear pattern into our data whose patter we have no idea about. This is where you would realise, we would need even better methods to get a higher accuracy because obviously, a linear fit wouldn't be that accurate in a non-linear setting).
The loss function $$\mathcal{L}(\theta)$$ is a metric which tells us how good or bad our model is from the ground truth. If the loss function is high, our model is bad and if it's low, our model is good. Let's use a simple loss function to illustrate this idea : The Mean Square Loss<center>
$$\mathcal{L}_{MS} = \sum_i (y_i - \hat{y_i})^2$$</center>
Here $$y_i$$ is the ground truth, and $$\hat{y_i}$$ is the predicted value by our neuron. We can see, if a lot of them differ, the loss will be high, and our model isn't good.
So here's how we proceed :
<center>
<div class="mermaid">
graph LR;
subgraph final
F["Final output"]
end
subgraph Repeat n times
A[Inputs] --> B[Model];
B --> C[Output];
E[Truth] --> D[Loss];
C --> D;
D -- Update model --> B;
end
C -. lowest loss .-> F
style B fill:#bff,stroke:#f66,stroke-width:2px,color:#f2f,stroke-dasharray: 5 5
</div>
</center>
(Note, although I wrote loss here, I'll dive into it for Perceptron. I'll stick to a simple accuracy score here)

We have seen the loss function, and the model. Now let's look into how to update the model (i.e update our parameter $$b$$) to improve performance. As our outputs can only be integers, we take iterate over all possible values of $$b$$ i.e $$\{0,1,\cdots n-1, n\}$$, compute accuracy for each instance and take the value of $$b$$ which gives the highest accuracy. We can write<center> $$\text{Accuracy} = \dfrac{\text{Correct predictions}}{\text{Total predictions}}$$</center>
Hence
<center>
<div class="mermaid">
graph LR;
A[Input] --> B["Model (b)"];
B --> C[Output]
C[Output] --> D[Accuracy]
E[Truth] --> D
D -- Increment b -->  B
D -- Best accuracy <br>and b --> F[Done]
</div>
</center>
Now, let's dive into how to do it in python. (Note, I am not showing the binarization of data. I am assuming my X and y are already binarized arrays).
The above process of finding the best $$b$$ is called training the model. We train on model on certain data, and test it out on certain data (obviously not the same as the one we trained on). For that, I will take the training data as X_train and y_train, and test data as X_test and y_test. Let's write a class for the MP Neuron.

```python
class MPNeuron():
	#__init__ function to initialise b
	def __init__(self):
		self.b = None

	#Our model : returns 1 if sum of all elements of array x >= b
	#else it returns 0
	def model(self, x):
		return (sum(x) >= self.b)

	#A predict function : to get the predicted values from our model
	def predict(self, X):
		Y = [] #List for predicted values
		for x in X:
			prediction = self.model(X)
			Y.append(prediction)
		return Y

	#The fit function : To update our model, i.e increment b
	def fit(self, X, Y):
		accuracy = {}
		for b in range(X.shape[1]+1):
			self.b = b
			y_pred = self.predict(X)
			accuracy[b] = accuracy_score(y_pred, Y) #Returns the accuracy
		best_b = max(accuracy, key=accuracy.get)
		self.b = best_b
		print("Optimal value of b is : ", best_b)
		print("Highest accuracy achieved is : ", accuracy[best_b])
```
