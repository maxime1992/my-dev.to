---
published: false
title: "Enigma machine, how does the famous encryption device work?"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/enigma-part-1/assets/enigma-cover.jpg"
description: "[Part 1] - Understand the machine"
tags: cryptography, enigma
series: "Enigma: Understand it, implement it, crack it"
canonical_url:
---

This blog post is the first of a serie of 3, called **"Enigma: Understand it, implement it, crack it"**:

1. **Enigma machine, how does the famous encryption device work? _[this blog post]_**

2. My take at implementing Enigma using Typescript _[coming soon]_

3. Let's crack messages encrypted with Enigma... From our browser! _[coming soon]_

# Table of contents

- [Intro](#intro)
- [Understanding the machine](#understanding-the-machine)
  - [High level principles](#high-level-principles)
  - [How does a rotor work](#how-does-a-rotor-work)
    - [Show me inside!](#show-me-inside)
    - [Alphabet and index](#alphabet-and-index)
    - [How do they interact with each others?](#how-do-they-interact-with-each-others)
    - [How and when do the rotors spin?](#how-and-when-do-the-rotors-spin)
    - [How does the spin impact the path of a letter?](#how-does-the-spin-impact-the-path-of-a-letter)
  - [What's a reflector?](#whats-a-reflector)
  - [Complete path](#complete-path)
- [Conclusion](#conclusion)
- [Challenge: Implement your own Enigma!](#challenge-implement-your-own-enigma)

If you find any typo please just make the edit yourself here: https://github.com/maxime1992/my-dev.to/blob/master/blog-posts/enigma-part-1/enigma-part-1.md and submit a pull request :ok_hand:

# Intro

Have you ever heard of **Enigma**?  
Maybe if I mention the movie "[The Imitation Game](https://www.imdb.com/title/tt2084970/)", does it ring any bells?

Enigma is an encryption device built in 1918, right after World War I. During World War II, the Germans started to use wireless communication systems (using radios and morse) on the battlefield because wires were fragile, could be cut and were hard to move. It also gives an important strategic advance as you could communicate from the land with a boat for example. There's only one catch: Whoever tunes in can listen to the broadcast. It's not what you really want to keep the advantage over your ennemy...

Instead of broadcasting plain messages, they decided to send encrypted ones, using Enigma.

![Enigma message](./assets/enigma-message.png 'Enigma message')

_A message encrypted with Enigma - Credit https://enigma.hoerenberg.com/index.php_

Few weeks ago, I went to [Bletchley Park](https://bletchleypark.org.uk/) (less than an hour from London by train). It's where a lot of efforts have been made in great secrecy to break Enigma's code. At some point, **9000 people** were working here on a daily basis and as small as the whole complex was, the importance of the mission was paramount.

I've been really amazed by the work of all the brilliant minds there, the whole organization and of course, by the "Bombe".

![Bombe machine](./assets/bombe-machine.jpg 'Bombe machine')

_Bombe machine, used to crack encrypted messages written with Enigma_

In order to get a better understanding of how Enigma works and what's happening behind the scenes, I've decided to implement a Typescript version of the machine. But before we dig into the code in the part II of this serie, we have to actually understand the mechanism first.

# Understanding the machine

Many versions of the Enigma machine exist. But today, we will be focusing on one of the first versions. Why?

- We want to understand the main concepts of the machine
- We don't want to get lost in too many details
- Newer Enigma machines were implemented on top of that one and the core part remains the same
- It's already a lot (of fun!) to understand and implement

A machine looks like the following:

![Enigma machine](./assets/enigma-machine.jpg 'Enigma machine')

_Image credit https://www.flickr.com/photos/timg_vancouver/200625463_

## High level principles

![Enigma high level principles](./assets/enigma-schema.jpg 'Enigma high level principles')

_Image credit https://web.stanford.edu/class/cs106j/handouts/36-TheEnigmaMachine.pdf_

- A battery is placed inside the machine
- An electric circuit is going from the battery, through the 3 rotors, then through a reflector, coming back through the 3 rotors again, to finally light up one of the output letters _(don't worry, that's the tough part and we will come back to all of that)_
- Typing a letter from the input (keyboard), will trigger a rotation on the rotor(s) and change the electric circuit, hence changing the path leading to a different output for same input letter

## How does a rotor work

### Show me inside!

From an internal point of view, a rotor is simply mapping letters to other letters.

![Enigma rotor exploded](./assets/rotor-exploded.jpg 'Enigma rotor exploded')

_A rotor - Image credit http://www.dgp.toronto.edu/~lockwood/enigma/enigma.htm_

Notice the yellow part above with all the wires? For every input of a letter, it's physically connected to a different output **or** the same output. (CF the pink cable around the top, connected to the output in front of the input --> same letter).

The first versions of the machine only used 3 rotors, but 5 where available. The connections inside the rotors didn't change, but it was possible to change the order of the rotors and their **initial letter**. Those settings were changed every days, generating a humonguous number of different solutions to encrypt a message.

### Alphabet and index

Here's an example of that remapping with the first 3 rotors:

- Rotor 1: `ekmflgdqvzntowyhxuspaibrcj`
- Rotor 2: `ajdksiruxblhwtmcqgznpyfvoe`
- Rotor 3: `fvpjiaoyedrzxwgctkuqsbnmhl`

The first thing you'll probably think about, is that it can be represented in the following way:

| Input R1 | Output R1 | Input R2 | Output R2 | Input R3 | Output R3 |
| -------- | --------- | -------- | --------- | -------- | --------- |
| A        | E         | A        | A         | A        | F         |
| B        | K         | B        | J         | B        | V         |
| C        | M         | C        | D         | C        | P         |
| D        | F         | D        | K         | D        | J         |
| E        | L         | E        | S         | E        | I         |
| F        | G         | F        | I         | F        | A         |
| G        | D         | G        | R         | G        | O         |
| H        | Q         | H        | U         | H        | Y         |
| I        | V         | I        | X         | I        | E         |
| J        | Z         | J        | B         | J        | D         |
| K        | N         | K        | L         | K        | R         |
| L        | T         | L        | H         | L        | Z         |
| M        | O         | M        | W         | M        | X         |
| N        | W         | N        | T         | N        | W         |
| O        | Y         | O        | M         | O        | G         |
| P        | H         | P        | C         | P        | C         |
| Q        | X         | Q        | Q         | Q        | T         |
| R        | U         | R        | G         | R        | K         |
| S        | S         | S        | Z         | S        | U         |
| T        | P         | T        | N         | T        | Q         |
| U        | A         | U        | P         | U        | S         |
| V        | I         | V        | Y         | V        | B         |
| W        | B         | W        | F         | W        | N         |
| X        | R         | X        | V         | X        | M         |
| Y        | C         | Y        | O         | Y        | H         |
| Z        | J         | Z        | E         | Z        | L         |

But it's important to correctly understand what the above means:  
**From the point of view of the rotor 1, the index 0 (A) is remapped to the index 4 (E)**.

Here's a visual example, where if we type the letter D as input, we would **so far** (without the reflector) get the letter E as the ouput:

![Letter passing through the rotors](./assets/letter-through-3-rotors.png 'Letter passing through the rotors')

Do you notice how the arrows between 2 rotors are always horizontal in the above schema?

### How do they interact with each others?

Physically, this is how the rotors are connected:

![2 rotors](./assets/2-rotors.jpg '2 rotors')

_Connection between 2 rotors - Image credit http://www.dgp.toronto.edu/~lockwood/enigma/enigma.htm_

It's important to understand that the "scramble" happens within the rotor itself and only the **index** of the output counts. Because a **pin from the first rotor will always be connected to the pin right in front of it**, to the other rotor.

### How and when do the rotors spin?

You can think of the 3 rotors like you would with the time displayed on a clock:

- Every seconds, the second hand will make one tick
- Every minutes, the minute hand will make one tick
- Every hours, the hour hand will make one tick

With Enigma, it's pretty much the same but with a base 26 instead of 60 (for the length of the alphabet).

- Every letters, the first rotor will make one tick
- Every 26th tick of the first rotor, the second one will make one tick
- Every 26th tick of the second rotor, the third one will make one tick

### How does the spin impact the path of a letter?

When the first rotor spins, the path will completely change.

If we type D as an input the first time, we have:

![Letter passing through the rotors](./assets/letter-through-3-rotors.png 'Letter passing through the rotors')

But if we type D again, the first thing happening is that the first rotor will move by an offset of 1. So the new path for a D will be:

![Letter through the rotors with R1 offset 1](./assets/letter-through-3-rotors-r1-offset-1.png 'Letter through the rotors with R1 offset 1')

And so on.

In the above, 2 important things to notice:

- The first rotor did spin by an offset of 1
- The first rotor can now be represented as starting with a B and ending up with an A
- The D letter from the keyboard is now in front of the E letter on the first rotor

## What's a reflector?

At the beginning of the _"High level principles"_, I mentionned briefly that the machine has a **reflector**.

If you look at the image again, you can see it on the left:

![Enigma high level principles](./assets/enigma-schema.jpg 'Enigma high level principles')

The particularities of a reflector are:

- It doesn't spin like the rotors
- It only has **one side**, which means that you can **never connect a letter to itself**, it has to be connected to a different one
- All its letters are connected to another one, otherwise the electrical circuit wouldn't be complete
- When the reflector outputs a letter, it will go all the way back through the 3 rotors

**Note:** The second point is a really important characteristic of the machine. When typing a letter as an input on Enigma, it is impossible to get the same letter as the ouput.

## Complete path

If we:

- Take the previous image were the first rotor had already ticked once
- Assume that the reflector is mapping the letters `T <==> Z` (+ all the others but only keeping the ones we need here)

The full path would look like the following when we type the letter D as the input:

![Complete path with reflector](./assets/complete-path-with-reflector.jpg 'Complete path with reflector')

# Conclusion

The core principles of Enigma are not so much complicated, but the machine was considered as a secure device (and unbreakable) for a long time due to all the possibilities, settings and "randomness" where you could type the same letter multiple times and get different outputs.

I hope you enjoyed learning about Enigma in this blog post. Please let me know in the comments if anything is unclear as the next part of the serie will be to see how we can simulate the behavior of the machine with Typescript.

# Challenge: Implement your own Enigma!

Can you come up with the above specs to **your own implementation of Enigma** before reading the part II of the serie? ;)

It doesn't matter the language, it doesn't matter the platform (web with a UI, command line, Android/iOS app, etc). If you manage to build it, share your code on an open source repository and let me know in the comments. I will add your solution to a list so that we can all easy find and compare different approaches! Spread the word :octopus: ...

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes.
