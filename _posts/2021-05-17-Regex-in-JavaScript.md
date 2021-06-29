---
layout: post
title:  "Regex in JavaScript"
date:   2021-05-17
excerpt: "Here are some notes I had made while reading about regex in JS"
image: "/images/regex-in-js.jpg"
---

# Regex in JavaScript

### What are regular expressions

Regular expressions are used in languages to create patterns to match parts of strings. 

### Test Method

To find the word `queue` in the string `I am standing in a queue`, we can use the regular expression: `/queue/`

````javascript
let myStr = "I am standing in a queue";
let myRegex = /queue/;
myRegex.test(myStr); // Returns true
````

What is we have different possibilities? Like I can also say, `I am standing in a line`. We can use the alternation [OR] operator denoted by `|` .  

````javascript
let myStr = "I am standing in a line";
let myRegex = /queue|line/;
myRegex.test(myStr); // Returns true
````

We can also use it for multiple such instances of words.  Now, another thing to notice is that, I am not case-matching, i.e if I mistakenly type `Queue` instead of `queue`, matching fails. Well, we can use the ignorecase flag here and can be written as `/queue/i`

### Match Method

We can extract the matches using this method using `'string'.match(/regex/)`, for example

````javascript
'I am standing in a queue'.match(/queue/); // Returns ["queue"]
````

To extract a pattern more than once, we use the `g` flag as `/queue/g`. We can also combine flags, such as `queue/gi`.

### Period

If we don't know the exact characters in the pattern, we can use the wildcard character `.` to match any one character for example `/ro./`

````js
'I have a rod, and I will rob'.match(/ro./)
````

### Character Classes

These allow you to define a group of characters which we want to match by using [ ] brackets.

````javascript
'I have a rod and it is red'.match(/r[oe]d/)
````

We can define a range of characters using `-`, such as `[a-o]` will match all characters from a to o. Similarly, `[1-3]` matches the numbers 1, 2 and 3. We can combine these too, as `[a-o1-3]`.

### Negated Character Set

The caret `^` denotes that we don't want to match these characters. For example `[^aeiou]/gi` matches all characters except vowels. 

To match characters which appear more than once in a row, we can use the `+` character, for example `/a+/g`. This matches characters that had occurred one or more times. Similar to this is the `*` character which matches zero or more times.

### Greedy and Lazy Matching

In greedy matching, we find the longest possible part of the string that fits the regex pattern. For example the regex `/t[a-z]*i/` is a pattern starting with t and ending with i, and by default regex is greedy so we can match `titanic`

On the other hand, lazy matching can be specified using the `?` character, such as `/t[a-z]*?i/` and this will match `ti` , and so lazy matching find the smallest possible part of string matching the regex pattern.  

 ### Match the Beginning and the End

If we use the caret `^` outside the character set, we will search patterns at beginning of the string. For example

````js
"This is my first line".test(/^This/); // Returns true
````

If we use the dollar `$` at end of the regex, we match patterns at end of strings

````js
"This is my first line".test(/line$/); // Returns true
````

### Match all Letters and Numbers

The `\w`	shortcut is equal to `[A-Za-z0-9_]`. If we want to search the opposite of this, we use `\W` which is equal to `[^A-Za-z0-9_]`.

To match all digits, we can use `\d` which is equal to `[0-9]`. Similarly, `\D` matches all non-digits.

To match whitespace, we use `\s`. Similarly `\S` matches non-whitespace characters.

### Specifying bound

Though `+` matches one or more times, and `*` matches zero or more times, we can use `{ }` to specify exactly how many times we want to match. For example `{3}` will match exactly thrice, `{3,5}` matches from 3 to 5 times, and `{3,}` matches three or more times.

````js
/a{3,5}/.test("abraaaa"); // Returns true
````

### Checking All or None

Sometimes patterns you want to search for may have parts of it that may or may not exist but we want to check them. We can use the `?` mark to check for zero or one of the preceding element (equivalent to saying that previous element is optional).

````js
/colou?r/.test("color"); // Returns true
````

### Positive and Negative Lookahead

Lookaheads are patterns that tell JavaScript to look-ahead in your string to check for patterns further along. This can be useful when you want to search for multiple patterns over the same string. 

Positive lookahead will look to make sure the element in the search pattern is there, but won't actually match it. It uses `(?=)` 

````js
"qu".match(/q(?=u)/); // Returns ["q"]
````

Negative lookahead will look to make sure the element in the search pattern is not there. It uses `(?!)`

```js
"qt".match(/q(?!u)/); // Returns ["q"]
```

For example, to match passwords greater than 5 characters long, and having 2 consecutive digits, we can write:

````js
/(?=\w{6,})(?=\D*\d\d)/.test(password);
````

### Checking Mixed Groups

To check for mixed groups, we can use `( )`. For example `/D(a|o)h/` matches both Dah and Doh.

### Capture Groups

We can use capture groups to search for repeat substrings. `()` is used to find the repeat substrings, and to specify where the repeat string will appear, we use `\` followed by a number (indexing starts at 1), so `\2` matches the second group.

````javascript
/(\w+)\s\1/.match("hello hello"); // Returns true
````

We can search and replace text using the replace method.

````js
let t = "I am a dog";
let r = "/dog/";
t.replace(r, "cat");
````

We can access capture groups in the replacement string with `$` signs

````js
"Dog Hot".replace(/(\w+)\s(\w+)/, '$2 $1'); // Returns Hot Dog
````

