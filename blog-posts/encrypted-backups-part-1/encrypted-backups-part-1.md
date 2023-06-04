---
published: false
title: "Local encrypted backups"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/encrypted-backups-part-1/assets/encrypted-backups-part-1-cover.png"
description: "Having backups for all your data is essential. But storing them in the cloud or on a local disk is not without any risks for privacy"
tags: backups, minio, duplicati, selfHosted
series: "Privacy focused, robust and efficient data backup strategy"
canonical_url:
---

# Intro

First article of a series that will explain in details **how to make encrypted backups**. This will cover the basics from a local backup strategy, up to a self hosted remote server to have off-site backups.

Before we dive right in the topic, here's an overall idea of the backup strategy:

- **Privacy focused**: Our data belong to us only. We'll use a strong encryption so that if someone has access to our backups, either locally or in the cloud, they won't have access to our data
- **Robust**: Always have at least 3 copies of your data, store them on at least 2 different storage media, have 1 off-site backup. We'll cover how to achieve this
- **Efficient**: Incremental backups. If we have 500 Gb of data and change 1 small text file, we only backup that change and not the entire disk
- **Software we can trust**: Rely on open source projects and community instead of private code source
- **Free of charge**: All the projects we'll use are free of charge. Hardware is not hold into account here but storage is pretty cheap these days so if you don't have any drives dedicated for backups it shouldn't be too much expensive to get one. If you appreciate the work done by the projects we'll be using though, consider making a donation so that they can keep up the great work!

There are so many ways to loose precious data. Accidental deletions, disk or system failure, viruses or your cat pushing your machine off a table. Taking a bit of time ahead and plan accordingly to have good backups is likely to serve you well one day. Let's get right to it!

# Meet Duplicati

[Duplicati](https://www.duplicati.com) is an open source project to run backups exactly how described above. Here's what the website says: "Backup software to store encrypted backups online".

For the online part, we'll get to that soon. But for now we'll focus on understanding that software and how to create some backups profiles.

## Installation

### Classic

Go to https://www.duplicati.com/download and get your version based on your OS.

### Docker

_If you don't know what Docker is or why you would need it, you probably don't need it here. Feel free to this part entirely._

As an alternative to a "classic" installation, if you're familiar with Docker it's also possible to run it as a container. This may be especially useful if you want to backup a server for example:

```
docker run -p 8200:8200 \
  -e "PUID=1000"
  -e "PGID=1000" \
  -e "TZ=Europe/Paris" \
  - v /some/path/on/your/machine/duplicati/config:/config \
  - v /some/path/on/your/machine/pictures:/source/pictures \
  - v /some/path/on/your/machine/videos:/source/videos \
  --name duplicati lscr.io/linuxserver/duplicati
```

Note on the above, remember to save the duplicati config somewhere as we'll define how to run our different backups and it would be lost otherwise.  
As for the volumes pointing to the `/source` directory in Duplicati, you can add as many as you want. It'll be the files available inside Duplicati for you to backup.

## Create a backup through the UI

Duplicati appears through a web UI, which is by default accessible at the port 8200. So you should be able to access it at http://localhost:8200.

![Duplicati first launch](./assets/duplicati-first-launch.png 'Duplicati first launch')

Here, you can decide whether you want to put a password to have access to the UI. That password will not be the one to encrypt your data, it's only the one to access the UI.

In the left menu, click on the "Add backup" link and select "Configure a new backup".

It's possible to have as many backup configurations as you wish. Overall I find it easy to have one with all my data by default but if you're working with large files and don't have them all stored on your laptop for example, you may just create another configuration to backup from an external hard drive. It'll be the exact same process.

![Duplicati general backup settings](./assets/duplicati-general-backup-settings.png 'Duplicati general backup settings')

On the first page, define a meaningful name for the backup.

Then comes the important part: The encryption. As **this is the key protecting all your data**, I'd strongly encourage you to use a password manager and generate a password that is really really really long. Like 50 or 100 chars, it doesn't matter. We're never going to type it by hand anyway, it'll always be copied from the password manager.

Moving on to page 2: The destination.

![Duplicati destination](./assets/duplicati-destination.png 'Duplicati destination')

In this case, we'll keep "Local folder or drive" for now, and we'll get back to remote destinations in another blog post of the series.

In the case where you've installed Duplicati using:

- The "classic" installation method, go to the file tree and select the folder where you want to store the backup
- Docker, you'll need to go to `/source` to see the volume you've mounted and select the folder where you want to store the backup

Either way, while we're doing a local backup, you should still avoid to store the backup on the same disk as the data. You should (if possible) target and external drive here.

Next in line: Source data.

![Duplicati source data](./assets/duplicati-source-data.png 'Duplicati source data')

In the case where you've installed Duplicati using:

- The "classic" installation method, go the file tree and select the files and/or folders that you want to backup
- Docker, you'll need to go to `/source` to see the volume you've mounted and select your files and/or folders from here

Nothing in that selection is final, you select a few folders, make a backup then edit the configuration and add some new folders for example.

Onto the next page: Schedule

![Duplicati source data](./assets/duplicati-source-data.png 'Duplicati source data')

Make sure to backup your data as regularly as possible. Duplicati lets you run automatic backups which are super helpful and easy to configure here.

Last but not least: The options page

![Duplicati options](./assets/duplicati-options.png 'Duplicati options')

For the remote volume size you can leave it as is it by default (50 Mb). If you do plan to make a lot of backups with loads of data, eventually check the [documentation](https://www.duplicati.com/articles/Choosing-Sizes/#remote-volume-size) about how to pick up a value that'll suit you best.

And for the backup retention, I think the best one by default is "Smart backup retention": "Over time backups will be deleted automatically. There will remain one backup for each of the last 7 days, each of the last 4 weeks, each of the last 12 months. There will always be at least one remaining backup". But of course feel free to pick the one that suits you the most.

Let's press the save button and we'll be back on the main page, except that now we have our backup configuration ready:

![Duplicati demo config ready](./assets/duplicati-demo-config-ready.png 'Duplicati demo config ready')

Press the "Run now" link next to the config name and the backup shall start. Once it's done you'll see how much time it took and when it was ran for the last time:

![Duplicati demo config done](./assets/duplicati-demo-config-done.png 'Duplicati demo config done')

File wise, I created 2 folders for the demo:

- `fake-external-hdd` which was initially empty and was set as the backup target
- `fake-internal-hdd` which initially had 2 files to backup and was set as the backup source

Before the backup, the file tree was:

```
./duplicati/data
├── fake-external-hdd
└── fake-internal-hdd
    ├── test-file-1.txt
    └── test-file-2.txt
```

Once I ran the backup the file tree became:

```
./duplicati/data
├── fake-external-hdd
│   ├── duplicati-20221007T133012Z.dlist.zip.aes
│   ├── duplicati-b48c9142a94c54c43b2d900abb82994b9.dblock.zip.aes
│   └── duplicati-ib156f4bab4dc4136b3fe7f83454cfb82.dindex.zip.aes
└── fake-internal-hdd
    ├── test-file-1.txt
    └── test-file-2.txt
```

Success! We've got our encrypted backup.

![Duplicati edit config](./assets/duplicati-edit-config.png 'Duplicati edit config')

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| Dev.to                                                                                                                              | Github                                                                                                                                           | Twitter                                                                                                                                              | Reddit                                                                                                                                                    | Linkedin                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) |
