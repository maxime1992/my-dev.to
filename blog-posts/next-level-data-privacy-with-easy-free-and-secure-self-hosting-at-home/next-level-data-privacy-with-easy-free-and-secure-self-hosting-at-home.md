---
published: false
title: "Next level data privacy with easy free and secure self hosting at home"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/next-level-data-privacy-with-easy-free-and-secure-self-hosting-at-home/assets/cover.png"
description: ""
tags: docker, opensource, selfhosting, privacy
series: "Self hosting and data privacy"
canonical_url:
---

Hello 👋!

Yes you read this well. **Self hosting made: Easy. Free. Secure**.
With a machine running at your house, not in the cloud. Even if you've never done that before.

That said, if you prefer to apply all this on a server you rent to some provider, it'll work the exact same way. You'll just skip the chapter on the router configuration.

_Let's clarify from the start what I mean by:_
- _**Easy**: The first setup isn't necessarily easy (nor complicated). But it takes a bit of time. We'll go through it all together. Once it's done, adding new apps will take a few seconds or minutes based on how complex the docker strategy is (integrated database or separate container to run Postgres for example)_
- _**Free**: You will not have to pay monthly or yearly bills for a server you rent online and a domain name because I'll explain how to setup everything locally using your desktop, laptop or a spare computer that you can keep open. You'd still have to pay for a machine if you don't have a spare one, as well as electricity to run it. That said, as a metric for this, my server has consumed ~60kwh in 6 months which makes it ~10kwh/month or ~2€/month._

---

# Intro

Have you ever wished to self host one of the +1000 brilliant open source project listed in [awesome-self](https://github.com/awesome-selfhosted/awesome-selfhosted) hosted? A project of your own? A school project? Or anything else that is web based? Sky _(or the RAM of your server)_ is the limit!

If you're afraid of:
- 🕵️‍♂️ Online solutions that have no respect for your **privacy**
- 💸 Online hosting solutions where you're 100% in control of the server and apps, but it can be **expensive**
- 🤷‍♂️ How to configure NGINX as it seems too **complicated**
- 🛡️ Expose your services **safely** on the internet

Fear no more! In this blog post we'll be starting from scratch, all the way up to have a local stack safely accessible from the outside of our own network.

# What we will achieve

Here's the high level breakdown of what we'll do:
- Install and use **[Docker](https://www.docker.com)** + **[Docker Compose](https://docs.docker.com/compose)** in order to have **self contained applications**
- Use **[DuckDNS](https://www.duckdns.org)** to create a **free domain name** that we can point to our public IP to have access to our apps from outside our home network _(note, you could skip this step and use your own domain name of course if you prefer to)_
- Use **[SWAG](https://docs.linuxserver.io/general/swag)** to manage our NGINX server, SSL certificates and `fail2ban` to ban people trying to brute force our services
- Use **[Authelia](https://www.authelia.com)** _(combined to our NGINX in SWAG)_ to add a double authentication layer in front of all our services
- Discuss about how to open up the ports on a **router** to be able to have access to your apps from the internet
- Access the default monitoring dashboard of SWAG from internet, behind our double authentication layer

As a bonus and real life demo I'll soon write another **blog post for this serie**, where we'll add 3 brilliant applications:
- **[Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx)** to manage all your digital documents
- **[Photoprism](https://github.com/photoprism/photoprism)** to manage all your pictures and videos
- **[Kopia](https://github.com/kopia/kopia)** to backup all your data from all the containers

At the end of this blog post, you will:
- Be able to have all this stack up and running
- Be in a position to add any other web app easily

Let's get started! 🔥
Hang tight for the initial setup. Things will get way easier once this is done.

---

# Architecture overview

As an image is often worth a thousands words, here's the high level overview of what we'll be setting up:

![Global architecture](./assets/global-architecture.png 'Global architecture')

_Note that we'll add the 3 apps at the bottom only in the next post of the series._

# DuckDNS setup

_As mentioned previously, this part is optional and if you prefer to use your domain name instead you can._

Head over [DuckDNS](https://www.duckdns.org) website and log in with the provider of your choice. You'll be setup in a matter of seconds. You should land on this page:

![Anonymized DuckDNS page example](./assets/anonymized-duck-dns-page-example.png 'Anonymized DuckDNS page example')


Note that the token displayed in the middle of the page must be kept secret, never share it. We'll get back to it soon.

In the domain input, type the domain name you wish to have pointing to your local setup. This will be the base of the public URL to access all your service. Something like `https://yourdomain.duckdns.org`.

You will only need one as we'll be using sub domains so don't name it for a specific app. For example, with the 3 apps we'll be setting up in the next post, we'll end up with the following URLs:
- `https://photoprism.yourdomain.duckdns.org`
- `https://paperless.yourdomain.duckdns.org`
- `https://kopia.yourdomain.duckdns.org`

---

From this point, all the commands we run should be run on the machine you decide to use as the server. If you only want to try out this whole stack without having a server, you can definitely give it a go from your current computer as well and migrate the setup to a server if you wish later on. I am running on Ubuntu so all the command will be Ubuntu based. That said it should be quite trivial to change the OS specific commands to match yours.

---

# Docker and Docker Compose setup

_I'll assume we start from scratch here. If you have Docker and Docker Compose installed already, you can skip this chapter._

## Docker

Run the following:

```bash
sudo apt-get update -y

sudo apt-get install -y \
     ca-certificates \
     curl \
     gnupg \
     lsb-release
     
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y

sudo apt-get install -y docker-ce docker-ce-cli containerd.io
```

## Docker Compose

```bash
cd ~
mkdir .docker
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
```

Let's make sure we can run Docker without being an admin:

_Replace `XXXXXXXXXX` by your user name._

```bash
sudo usermod -a -G docker XXXXXXXXXX
newgrp docker
```

# SWAG setup

If you wish to dig more into SWAG setup, here's the _[official documentation](https://docs.linuxserver.io/general/swag)_.

SWAG is no exception to the rule and it'll be ran as a Docker container. We will now create our `docker-compose.yaml` file that'll let us define all the containers we want to run.

I'd recommend to create a new folder so that all the data from our several containers will be hosted in the same folder, making our lives easier for when we look into Kopia and the backup system. In my case, I've defined it at `~/opt` which is a folder I've created myself. If you point to a different folder, make sure to update the paths accordingly in the docker compose file.

Create a file called `docker-compose.yaml` and paste the following in it:

```yaml
version: '3.0'

services:
  swag:
    image: lscr.io/linuxserver/swag:latest
    container_name: swag
    cap_add:
      - NET_ADMIN
    env_file:
      - common.env
      - swag.env
    environment:
      - URL=yourdomain.duckdns.org
      - VALIDATION=duckdns
      - SUBDOMAINS=wildcard
      - DOCKER_MODS=linuxserver/mods:swag-dashboard
    volumes:
      - ~/opt/swag/config:/config
    ports:
      - 443:443
      # https://github.com/linuxserver/docker-mods/tree/swag-dashboard#internal-access-using-server-ip81
      # open port 81 for the dashboard
      - 81:81
    restart: unless-stopped
```

- Make sure to update the `URL` in the `environment`. It's the one you've defined in your DuckDNS earlier
- Don't forget to change the path for the volume if you've decided to put your files somewhere else than `~/opt`. You could just put `./swag/config:/config` but then you'd need to make sure to always launch the docker compose from that directory
- Feel free to change the ports `443` and `81` if they're already taken to anything you'd like. Remember to only edit the port on the **left side** of the `:` as the one on the right is the internal binding for the container

Then create 2 files at the same level:

`common.env`:

```yaml
PUID=1000
PGID=1000
TZ=Europe/Paris
```

To find out your own `PUID` and `PGID`, type in your console `id` and you'll something like this:

```bash
$ id
uid=1000(maxime) gid=1000(maxime)
```

Use these 2 values.

As for the timezone `TZ`, you can find it [here on Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), in the `TZ Identifier` column.

`swag.env`:

```yaml
DUCKDNSTOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Of course, replace it with the token displayed on your DuckDNS page.

Time to start our first container!

```bash
$ docker compose up -d
```

It should pull the container if you don't have it already and you should see a message like this: 

```bash
✔ Container swag Started
```

To make double sure everything went well, we can also check the logs of the container:

```bash
$ docker logs swag
```

You'll see a bunch of logs but the most important line being the last one: `Server ready`.

Notice as well that a `swag` folder was created!

![SWAG folder created](./assets/swag-folder-created.png 'SWAG folder created')

Without further ado, let's access the integrated SWAG dashboard... From the internet by configuring our router.

# Router configuration

Whether you have your own router or the default "box" provided your internet provider, you will have access to all the settings. That said, each router has it's own UI and I cannot cover all of these. So you will have to search a little bit in your router configuration to find out where you need to access the settings I'll mention. If you don't find them, Google is your friend for this part!

Search in the settings for **DHCP**. This will let us attribute a local static IP to our computer running SWAG. Create a new rule. It'll ask you what's the device you wish to configure. If it's a little bit smart, it'll list the devices and their IP and you'll be able to select from there. If not, you'll have to enter the current IP and the MAC address of the computer.

Once done, search for **`NAT & PAT`** or **`NAT forwarding`** or **`Port forwarding`**. This will let us bind a port of our **public** IP and redirect to a given **local** IP + port. In our case, we will need to have only 1 rule here as we'll be using sub domains to have multiple apps under the same base domain. Create a new rule, for all the protocols _(`TCP`+`UDP`)_. Define the external port to be `443`. You'll then need to point to a given internal IP and a given port. Specify your computer IP as for the port it'll be `443` as well _(or if you changed the `443` port of our `docker-compose.yaml` file, put the one you wrote here)_.

As we've passed the environment variable `DOCKER_MODS=linuxserver/mods:swag-dashboard`, SWAG gives us access to an admin dashboard. Therefore, if everything went well with the router configuration, we should now have access to it from internet! Try to access your domain name with the subdomain `dashboard`: https://dashboard.yourdomain.duckdns.org

You should see this 🎉:

![SWAG Dashboard](./assets/swag-dashboard.png 'SWAG Dashboard')

Feels awesome right?!

You may think though that it's not really a good idea to expose an admin dashboard publicly on the internet. And you'd be right! Let's jump into the next chapter to setup some additional security.

# Authelia and double authentication

[Authelia](https://www.authelia.com) is a fantastic piece of open source software which:

> Authelia is an open-source authentication and authorization server and portal fulfilling the identity and access management (IAM) role of information security in providing multi-factor authentication and single sign-on (SSO) for your applications via a web portal. It acts as a companion for common reverse

Essentially, it'll let you put an (extra) **authentication layer 🔐 in front of any deployed services 🛡️**. You can setup 2 factor authentication _(**2FA**)_ for reinforced security as well.
🍒 on the cake, you can even define per user access to your apps. To be clear, if an app you deploy has already a login/password access, you can decide to expose it on the internet. But if the security of that app is weak, you may be in troubles. Authelia lets you plug an extra layer with 2FA in front. You'll only have to log once to Authelia and then still log independently to any app that has its own id/password login. Let's crack on!

Add the following service to our `docker-compose.yaml` file:

```yaml
  # to add a user, add directly to `authelia/users_database.yml`
  # then get the encrypted password with
  # docker run --rm ghcr.io/authelia/authelia:4.34.6 authelia hash-password yourpassword
  # https://www.linuxserver.io/blog/2020-08-26-setting-up-authelia#users_database-yml
  authelia:
    image: ghcr.io/authelia/authelia:4.34.6
    container_name: authelia
    env_file:
      - common.env
    volumes:
      - ./authelia:/config
    restart: unless-stopped
```

Run `docker compose up -d` so that the Authelia container gets started as well.

You'll see that a new folder `authelia` will be created with 1 file. But if we look into the logs, we can see that something needs to be fixed before we can actually use Authelia:

```bash
$ docker logs authelia
```

Gives us:

```
time="2023-06-02T22:34:09+02:00" level=error msg="Configuration: storage: option 'encryption_key' must is required"
time="2023-06-02T22:34:09+02:00" level=fatal msg="Can't continue due to the errors loading the configuration"
```

This is normal, it's because it's the first time the app is launched and for security reason, we need to change some default values in the config. Let's edit `authelia/configuration.yml` and replace it with the following:

```yaml
# https://www.linuxserver.io/blog/2020-08-26-setting-up-authelia

server:
  host: 0.0.0.0
  port: 9091
  read_buffer_size: 4096
  write_buffer_size: 4096
  path: "authelia"
log:
  level: info
  file_path: /config/logs/authelia.log
jwt_secret: TODO_SOME_RANDOM_SECRET_HERE
default_redirection_url: https://authelia.yourdomain.duckdns.org
totp:
  issuer: authelia.yourdomain.duckdns.org
authentication_backend:
  disable_reset_password: true
  file:
    path: /config/users_database.yml
    password:
      algorithm: argon2id
      iterations: 1
      key_length: 32
      salt_length: 16
      memory: 512
      parallelism: 8
access_control:
  default_policy: deny
  rules:
    - domain:
      - yourdomain.duckdns.org
      - "*.yourdomain.duckdns.org"
      policy: two_factor
      subject:
      - 'user:TODO_YOUR_AUTHELIA_USER_NAME_HERE'
session:
  name: authelia_session
  secret: TODO_SOME_OTHER_RANDOM_SECRET_HERE
  expiration: 1h
  inactivity: 5m
  remember_me_duration: 1M
  domain: yourdomain.duckdns.org
regulation:
  max_retries: 3
  find_time: 2m
  ban_time: 5m
storage:
  encryption_key: TODO_SOME_RANDOM_ENCRYPTION_KEY_HERE
  local:
    path: /config/db.sqlite3
notifier:
  disable_startup_check: false
  filesystem:
    filename: /config/notification.txt
```

Update all the following:
- `TODO_SOME_RANDOM_SECRET_HERE`
- `TODO_YOUR_AUTHELIA_USER_NAME_HERE`
- `TODO_SOME_OTHER_RANDOM_SECRET_HERE`
- `yourdomain`
- `TODO_SOME_RANDOM_ENCRYPTION_KEY_HERE`

For secrets and encryption keys, generate long and random strings❗

To avoid an error with the container, create an empty file: `authelia/logs/authelia.log`.

Then do `docker compose down && docker compose up -d`.
You should see a bunch of new files created in the `authelia` folder and `docker logs authelia` shall show a few `level=info` but no errors ✅.

Last but not least, we need to add a user otherwise it'll be hard to log in!

Launch the following command to encrypt your chosen password for Authelia: 

```bash
$ docker run --rm authelia/authelia:latest authelia hash-password yourpassword
```

Change of course `yourpassword` to a very strong password as this will be your entry point to Authelia. Generating it using a password manager is a good idea.

It'll then print the encrypted password to the console. Keep it there for now and head over `authelia/users_database.yml`.

Edit this file with the following content:

```yaml
users:
  your-user-name:
    displayname: "your-user-name"
    password: "Put the hashed password generated here starting with $argon2"
```

Don't forget to change the username _(twice)_ to whatever you want and update the password with the one we just generated.

Now that Authelia is configured, let's expose it through a given subdomain. For this, thanks to all the templates that SWAG has, it's really easy for most apps that we want to add! 

In this case, copy `swag/config/nginx/proxy-confs/authelia.subdomain.conf.sample` to `swag/config/nginx/site-confs` and rename `authelia.subdomain.conf.sample` to `authelia.subdomain.conf`.

Restart both services with `docker compose down && docker compose up -d` then go to https://authelia.yourdomain.duckdns.org and...

![Authelia login page](./assets/authelia-login-page.png 'Authelia login page')

VICTORY! 🎉

If you try to log in, you'll get a message saying that you need to activate double authentication to access that resource. And it makes sense as we've specified this as the default in our config! Click on this button:

![Authelia activate double authentication](./assets/authelia-activate-double-authentication.png 'Authelia activate double authentication')

You'll see a notification:

![Authelia notification](./assets/authelia-notification.png 'Authelia notification')

It's obviously not true because we haven't setup any email provider but Authelia has a clever trick and writes the content instead to `authelia/notification.txt`. It'll look like this:

```
Date: 2023-06-02 23:13:28.051443925 +0200 CEST m=+216.364147029
Recipient: 
Subject: Register your mobile
Body: 
This email has been sent to you in order to validate your identity.
If you did not initiate the process your credentials might have been compromised. You should reset your password and contact an administrator.

To setup your 2FA please visit the following URL: https://authelia.yourdomain.duckdns.org/one-time-password/register?token=some-random-token

Please contact an administrator if you did not initiate the process.
```

Open up the link that's written and it'll show you a page with a QR code. 

![Authelia double authentification QR code](./assets/2FA-QR-code.jpg 'Authelia double authentification QR code')


With your favourite 2FA authentication app, add it. For example you can use Google Authenticator.

Brilliant! We've got Authelia and 2FA setup 🔥!

But wait, our dashboard at https://dashboard.yourdomain.duckdns.org is still not protected. Let's edit `swag/config/nginx/proxy-confs/dashboard.subdomain.conf` but first: Note that, usually the `proxy-confs` contains all the templates and for the apps you want to expose, you copy one the corresponding template to the `site-confs` folder next to it. In this case the dashboard template is here by default for some reason, feel free to move it to `site-confs` instead!

Anyway, let's edit `dashboard.subdomain.conf`. All you have to do for every new `.conf` file that you use to expose a new service, is to check for the lines with a comment

```
# enable for Authelia
```

and uncomment the next line. **Make sure you do that on all occurrences of the comment**.

There should be at least:
- `include /config/nginx/authelia-server.conf`
- `include /config/nginx/authelia-location.conf`

In this case, there are 5 lines to uncomment ⚠️!

Now reload both services: `docker compose down && docker compose up -d` and head over your dashboard. It should not be accessible directly and you shall see the Authelia authentication page.

---

**Pro tip 💡:** Notice how the URL goes from `https://dashboard.yourdomain.duckdns.org` to something like `https://dashboard.yourdomain.duckdns.org/authelia/?rd=https%3A%2F%2Fdashboard.yourdomain.duckdns.org%2F` ?

If you're using a password manager, assuming it's got regex support for URL detection, it's possible to separate your apps from the Authelia login which is very convenient instead of having a domain match that'd just always show you the Authelia entry as the domain doesn't change when Authelia login shows up. It's just the end of the URL.

For your Authelia entry in your password manager, enter this:

```
https:\/\/([1-9-a-z-]*)\.yourdomain\.duckdns\.org\/authelia
```
For all your apps, enter this _(example with Paperless that we'll setup later)_:

```
^https\:\/\/paperless\.yourdomain\.duckdns\.org(?!(/authelia))
```

This way, when your app doesn't open the Authelia page your password manager will only show 1 entry for the app, and when Authelia shows up it'll only show Authelia, not all of your apps entries.

---

I believe **data privacy is important** and being able to self host applications where you own your data is like a super power. In the next post of the series, I'll show how to setup 3 of my favourites **open source apps to manage your documents, pictures and backup** all that safely.

If you're interested in more articles about Angular, RxJS, open source, self hosting, data privacy, feel free to hit the **follow button** for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).
