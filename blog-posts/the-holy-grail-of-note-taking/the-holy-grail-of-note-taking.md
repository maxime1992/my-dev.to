---
published: true
title: "The holy grail of note-taking: Private data, efficient methodology and P2P encrypted sync across all your devices"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/the-holy-grail-of-note-taking/assets/cover.png"
description: "Take the control back on your notes and your data privacy"
tags: opensource, selfhosting, privacy, tutorial
series:
canonical_url:
---

# Disclaimer

_I have learnt very quickly that opiniated articles can get any random stranger with a different opinion to challenge you to death behind his keyboard because you're not enjoying the same things as he does. Therefore I'm going to start this article with a note: **This blog post is strongly opiniated**. I'm sharing what I like, in case it can be helpful to some. If you've got a different point of view, if you use a different software, if you use a different methodology, **don't be offended**. Simply share a comment with your opinion explaining why you prefer something different. We don't have to all agree and having multiple feedback will always help others as long as it's constructive. Without further ado, let's get started 🙂!_

# Intro

Evernote, Microsoft OneNote, Apple Notes, Google Keep, Notion, ... There is a huge number of note-taking apps out there! From dead simple to more sophisticated ones.

One thing the apps I listed above have in common though, isn't to please me: **They're in charge of our data**. **Our notes**. While this can surely make our lives easier at first, we often end up writing a lot of precious data in those. If these apps are free, that is for a very good reason: **Nowadays, data is gold for tech giants**.

But what if I told you there was a non painful way to keep all your notes:

- In **sync** across all your devices
- **Private**
- In a **standard** format, easily exportable

All that quite easily. Which pill do you choose?

![Blue or red pill](./assets/pills.png 'Blue or red pill')

_When Midjourney makes you choose Morpheus style, you've got enough pills for a lifetime. Won't need another prescription._

# Red pill

Welcome to the rabbit hole 🐇.

## Note-taking software

I've always been taking notes. Loads of notes. Not super organized, not very thought through, but at least, I had something. About a year ago, I decided it was time to investigate into a better solution as my number of notes started to grow up and it was all becoming a mess.

With data privacy as the key factor, I was looking for a local application, that'd not be in charge of hosting my data and which was using a standard format: **Markdown**.

After a bunch of research and comparisons, one stood out based on feedback I read: **[Obsidian](https://obsidian.md)**. It was time to give it a go.

Obsidian is described as:

> The private and flexible note‑taking app that adapts to the way you think.

Here's how it looks _(yes they do respect developers, there's a dark theme)_:

![Obsidian home page](./assets/obsidian-home-page.png 'Obsidian home page')

🍒 on the cake, it's been built to be super modular and **supports plugins**. Because of the huge community, there's nearly **1000 community plugins** available when I'm writing those lines. 988 to be exact.

What I like about Obsidian:

- Cross platform (including mobile apps)
- Beautiful UI
- Local
- Offline by default
- Tags
- Graph view to see connections between notes
- Community plugins
  - **Advanced tables**. Makes it really easy to manage tables in Markdown without having a mess
  - **Excalidraw**. I've been using [Excalidraw](https://excalidraw.com) since it came out. It was love at first sight. It felt trivial to draw anything I had in mind to illustrate ideas quickly. This integration makes it easy to integrate drawings in notes. While I'm not using it (yet?!), it's worth noting that a few months back, Obsidian added "[Canvas](https://obsidian.md/canvas)" in its core which is similar and maybe more integrated with Obsidian
  - **Linter**. Add a [frontmatter](https://help.obsidian.md/Editing+and+formatting/Metadata) with metadata about the creation date of notes and edit date as well
  - **Navigate cursor history**. While coding, having on your mouse the side buttons to go back and forth in your code is fantastic. This plugin gives you 2 arrows in Obsidian to have the same feature if you only have a trackpad
  - **Prettier format**. I prefer to use this instead of the linter mentioned above as Prettier has a huge community and is strongly opiniated
  - **Reading time**. To know how long I'm going to bore you with my articles
  - **Tag wrangler**. To manage existing tags, for example rename them. It detects all the tags in a smart way instead of just doing a string comparison which could affect some text as well if you were to make a global search and replace
  - **Obsidian Git**. I'll talk later on how to sync your notes on different devices but be aware of this plugin that can be useful as well

Whatever OS you're using, just go to the [download page](https://obsidian.md/download) and pick the one you want.

Before moving on, I have to say that I have a wish for Obsidian: **May it become open source one day**. I know the data remains in the users' hands but if Obsidian was to open its code, I feel like it could become a lot stronger than it already is. You can find out more [here](https://www.reddit.com/r/ObsidianMD/comments/tv6uql/is_obsidian_open_source).

Now that we've got the note-taking software, do we just start creating all of our notes as usual?

## Methodology

As mentioned previously, I started to look into note-taking apps alternatives when my number of notes started to grow and it felt messy, hard to find the notes I was looking for.

![Notes, notes everywhere](./assets/notes-everywhere.png 'Notes, notes everywhere')

So I started investigating how to take notes properly. While there are an infinite number of solutions out here, eventually I came across a method called **PARA**, which stands for:

- **P**roject
- **A**rea
- **R**esource
- **A**rchive

I'll summarise what it's all about but feel free to read this [excellent article](https://fortelabs.com/blog/para) about it.

The PARA method gives you a way to organise all your notes, into 4 main categories _(just folders)_, which are the ones I listed above.

I've kept the overall idea but renamed a few of them for my notes as it just made more sense to me.

| PARA     | My folders equivalent   |
| -------- | ----------------------- |
| Project  | Projects                |
| Area     | Areas of responsibility |
| Resource | Resources               |
| Archive  | Archives                |

Not much difference, but it's just clearer IMO.

I'll give some examples from my own vault to make it clearer where notes should go. I use a lot of sub folders as well in those. It's just important to limit the top level architecture to these 4 folders.

### Projects

I've got `Art`, `Domotic`, `House work` and `Wood working`. Each of these can have sub folders again and as many notes as I want.

This is for ongoing projects. Active ones. Some other examples could be notes for blog posts, YouTube videos you want to create, organising an event, etc.

### Areas of responsibility

I've got `Car`, `House work`, `Professional development`.

The name is quite self explanatory. Here are some examples that could go in there: `Kids`, `Health`, `Taxes`, etc.

### Resources

I've got `Family`, `Games`, `House`, `IT`, `Medias`, `Travels`.

Some of these folders sounds like they could be in "projects" or "areas of responsibility" but I could have the same folder name in those. Here it's really for notes that are not "projects" or "areas of responsibility" related. General information notes. For examples, I've got "House work" in "Projects" but also "Areas of responsibility" and here "House". In the first one, I put really important house work like renovating the house before for next winter. In the second one, I put some active projects like replacing a few things not working etc. As for here, in resources I put general knowledge like references of different equipments so I don't have to look for them all the time when I need an info, what I think is important to look for if I ever move to another house, etc.

### Archives

For this one, I like to have one sub folder per year, and for each year one sub folder for each of the PARA points. Then I just move notes that are not relevant to me anymore from the other 3 folders to here. If I ever need them back, I can find them, if I don't, they're not shifting my focus away while looking in the 3 main folders.

---

This method can easily be applied along the way and if you wish to give it a go but you have loads of notes already, you can migrate one file at a time, when reading one for example. I've been using this method for over a year and I find it very effective to organise all my notes.

## Synchronisation software

We've got our Obsdian app setup, we know how to organise our notes. The last question remaining is how to synchronise our notes across several devices, for example between a laptop, a desktop and a phone.

While this is not the solution I'm going to present, be aware that Obsidian offers its own solution for this, it's called [Sync](https://obsidian.md/sync). It's not free, but may be a good way to support the development of Obsidian as well!

Personally, I've been using an open source equivalent of Dropbox that is called [Syncthing](https://syncthing.net). I invite you to read on their main page what they offer but essentially it's here for secure data exchange between devices, privately.

Syncthing is available on all the different OS, you can check the [download page](https://syncthing.net/downloads). If you wish to use it from a server as well, you can install it easily with Docker _(either from [LinuxServer package](https://hub.docker.com/r/linuxserver/syncthing) or the [official one](https://hub.docker.com/r/syncthing/syncthing))._

Here's how the UI looks _(image taken from the official webpage as an example)_:

!['Syncthing UI'](./assets/syncthing.png 'Syncthing UI')

- On the left, it's all the folders we want to sync
- On the top right, "this device" shows several info for the current device (upload/download speed of files, number of files in sync and total weight, etc)
- On the bottom right, "Remote devices" shows all the devices you've linked to this one. For example if we're looking at the UI of your desktop, you could see your laptop and your phone here. It shows whether they're online and up to date or not

To add a new device, select "Actions" at the top right, and "Show ID".

It'll show a modal like this one:

!['Syncthing device ID'](./assets/syncthing-device-id.png 'Syncthing device ID')

_Anonymized screenshot, it shows a QR code instead and at the top, some random letters different that xxxxx of course._

You can then either scan the QR code from your phone or if it's another computer, just send the unique ID displayed at the top.

After a few seconds, it'll show you on a modal at the top of syncthing with the ID of the remote device _(that you should always double check)_ and if you accept, the devices will be linked together.

After this, you can select a folder to share:

!['Syncthing folder to share'](./assets/syncthing-add-folder.png 'Syncthing folder to share')

Like the one containing your Obsidian vault with all your notes for example _(or anything else really, could even be a folder to share pictures from your phone in real time when you take them!)_.

There's then a tab "Sharing" in which you can select which device you want to share this folder with. What's really nice about this is that **you can have more than 2 devices in sync for the same folder**. Meaning that you can increase the chance of having them always up to date because the sync is done in all the direction whenever the devices are online.

⚠️ **Important** ⚠️

As noted by [_bouche_bag_ on Reddit](https://www.reddit.com/r/Syncthing/comments/1434gu7/comment/jn8punm/?context=3), Syncthing is here synchronise files across devices but **does not replace a backup strategy**.  
I plan on making an article about [Kopia](https://kopia.io) to explain how to make regular backups of your data easily but meanwhile you can look into it yourself if you want. It's definitely not the only solution out there, just an idea. Feel free to compare with other backup softwares.

# Conclusion

If you care about data privacy, this could be a solid way to have your notes in sync across several devices without sharing all your data with a big corp. They're also going to be always available, even offline as once the sync is done, your notes are on your device.

As explained, this is how I do things for now, but **I'd be delighted to hear more from you and especially which note-taking app is your favourite and why**. Who knows, we may all discover the next best app thanks to 1 comment.

Thanks for reading!

---

I hope you enjoyed this article, if you did let me know with a reaction and eventually drop a comment. It's always nice to hear back from people who took the time to read a post 😄!

If you're interested in more articles about Angular, RxJS, open source, self hosting, data privacy, feel free to hit the **follow button** for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| &nbsp;                                                                                                                              | &nbsp;                                                                                                                                           | &nbsp;                                                                                                                                               | &nbsp;                                                                                                                                                    | &nbsp;                                                                                                                                                                | &nbsp;                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) | [![Stackoverflow](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/stackoverflow-logo.png 'Stackoverflow')](https://stackoverflow.com/users/2398593/maxime1992) |

# You may also enjoy reading

| [!['Cover'](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/next-level-data-privacy/part-1-next-level-data-privacy-with-easy-free-and-secure-self-hosting-at-home/assets/cover.png?bustCache=2)](https://dev.to/maxime1992/next-level-data-privacy-with-easy-free-and-secure-self-hosting-at-home-2c84) | [!['Cover'](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/detect-unnecessary-renderings-of-dom-elements/assets/cover.png)](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd) |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Next level data privacy with easy, free and secure self hosting at home](https://dev.to/maxime1992/next-level-data-privacy-with-easy-free-and-secure-self-hosting-at-home-2c84)                                                                                                                                                 | [How to detect unnecessary renderings of DOM elements in your web app to improve performance](https://dev.to/maxime1992/how-to-detect-unnecessary-renderings-of-dom-elements-in-your-web-app-to-improve-performances-13jd)                                                         |
