---
published: true
title: "Paperless-ngx, manage your documents like never before"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/next-level-data-privacy/part-2-paperless-ngx-manage-your-documents-like-never-before/assets/cover.png?bustCache=1"
description: ""
tags: docker, opensource, selfhosting, privacy
series: "Self hosting and data privacy"
canonical_url:
---

Hi there 👋!

In the [previous post](https://dev.to/maxime1992/next-level-data-privacy-with-easy-free-and-secure-self-hosting-at-home-2c84) of this series, we've seen how to setup a server to self host any web application, at home and expose it safely to the web.

In this one, **we will be adding our first "real" application: [Paperless-ngx](https://github.com/paperless-ngx/paperless-ngx)**.

# Paperless-ngx

The description of the project on Github is:

> A community-supported supercharged version of paperless: scan, index and archive all your physical documents

I've been using Paperless-ngx for months now and I'm truly impressed that an **open source, non commercial project** _(in any way)_ can be this good. Start uploading all your documents, add a few tags, correspondents, documents types, start assigning those to the documents you've imported and let the magic happen 🪄. **Paperless-ngx will learn from your documents and habits, and then be able to automatically assign tags, correspondents, types, dates etc**. The initial phase on which you have to upload and tag all your documents _(could be thousands)_ can be time consuming based on how many you want to triage at first. But once that's done and you enter "routine mode", uploading documents one at a time when you receive them, will take only seconds.

It's 100 times better than saving documents on a Google Drive like service where you organize documents by folder IMO. I was never satisfied with any of the option I had. Organized folders by year? Types? Correspondents? What happens the day you want to search by another criteria? Not a very good experience.

Here are some of the features highlights for Paperless-ngx:

- 💅 Nice web UI
- ⚙️ Upload multiple documents and they'll be queued/processed quickly and analysed/indexed
- 👀 OCR is ran on all the documents, meaning that even if you upload pictures, you'd still be able to search by text
- 👫 Users and groups permissions. You can have multiple users on the same instance and easily share documents
- 🔎 Fantastic filtering to find any document quickly. Date range, tags, correspondents, document types, actual content, even though it was a picture thanks to the OCR mode...

![Paperless-ngx screenshot](./assets/paperless-ngx-screenshot.png 'Paperless-ngx screenshot')

# Setup in our Docker Compose

The first thing we need to do is to get the service up and running. We'll see how to expose it through swag as a new sub domain right after.

Open up the `docker-compose.yaml` file we created in the previous blog post and add the following 3 services:

_Remember to edit the volumes path if you don't want to save the data in `~/opt` folder._

```yaml
--- # ----------------------------
# ----------------------------
# PAPERLESS-NGX
# Source: https://github.com/paperless-ngx/paperless-ngx/blob/main/docker/compose/docker-compose.mariadb.yml
# to add a user: `docker compose run --rm paperless-ngx-webserver createsuperuser`
paperless-ngx-broker:
  image: docker.io/library/redis:7
  container_name: paperless-ngx-broker
  env_file:
    - common.env
  restart: unless-stopped
  volumes:
    - ~/opt/paperless-ngx/broker:/data

paperless-ngx-db:
  image: docker.io/library/mariadb:10
  container_name: paperless-ngx-db
  restart: unless-stopped
  volumes:
    - ~/opt/paperless-ngx/db:/var/lib/mysql
  env_file:
    - common.env
    - paperless-ngx.database.env
  environment:
    - MARIADB_HOST=paperless
    - MARIADB_DATABASE=paperless
    - MARIADB_USER=paperless

paperless-ngx-webserver:
  image: ghcr.io/paperless-ngx/paperless-ngx:latest
  container_name: paperless-ngx-webserver
  restart: unless-stopped
  depends_on:
    - paperless-ngx-db
    - paperless-ngx-broker
  healthcheck:
    test: ['CMD', 'curl', '-f', 'http://localhost:8000']
    interval: 30s
    timeout: 10s
    retries: 5
  volumes:
    - ~/opt/paperless-ngx/webserver/data:/usr/src/paperless/data
    - ~/opt/paperless-ngx/webserver/media:/usr/src/paperless/media
    - ~/opt/paperless-ngx/webserver/export:/usr/src/paperless/export
    - ~/opt/paperless-ngx/webserver/consume:/usr/src/paperless/consume
  env_file:
    - common.env
    - paperless-ngx.database.env
  environment:
    - PAPERLESS_REDIS=redis://paperless-ngx-broker:6379
    - PAPERLESS_DBENGINE=mariadb
    - PAPERLESS_DBHOST=paperless-ngx-db
    - PAPERLESS_DBUSER=paperless
    - PAPERLESS_DBPORT=3306
    - PAPERLESS_URL=https://paperless-ngx.yourdomain.duckdns.org
# ----------------------------
```

Also remember to edit the `PAPERLESS_URL` with `yourdomain` and replace accordingly.

Then create at the same level of the `docker-compose.yaml` a file called `paperless-ngx.database.env` with the following content:

```yaml
MARIADB_ROOT_PASSWORD=GENERATE_STRONG_PASSWORD_1_HERE
MARIADB_PASSWORD=GENERATE_STRONG_PASSWORD_2_HERE
PAPERLESS_DBPASS=PUT_THE_SAME_AS_STRONG_PASSWORD_2_HERE
```

Let's spin those up!

```
docker compose up -d
```

and add a user:

```
docker compose run --rm paperless-ngx-webserver createsuperuser
```

It'll prompt you from the command line to enter a few info and then you should end up with this message:

```
Superuser created successfully.
```

Time to expose our application to access it.

# Expose the service with SWAG and NGINX

Whenever you want to expose a new application, the first thing to do is check if there's a pre-defined templates offered already for us in `swag/config/nginx/proxy-confs`. Unfortunately, that's not the case for Paperless-ngx. Maybe it'll be added later on!

This is not an issue at all though, because they offer a default template that works straight away in most cases. Copy `swag/config/nginx/proxy-confs/_template.subdomain.conf.sample` to `swag/config/nginx/site-confs` and rename it `paperless-ngx.conf` in the new folder.

Edit it to end up with:

```
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name paperless-ngx.*;

    include /config/nginx/ssl.conf;

    client_max_body_size 0;

    # enable for ldap auth (requires ldap-location.conf in the location block)
    #include /config/nginx/ldap-server.conf;

    # enable for Authelia (requires authelia-location.conf in the location block)
    include /config/nginx/authelia-server.conf;

    location / {
        # enable the next two lines for http auth
        #auth_basic "Restricted";
        #auth_basic_user_file /config/nginx/.htpasswd;

        # enable for ldap auth (requires ldap-server.conf in the server block)
        #include /config/nginx/ldap-location.conf;

        # enable for Authelia (requires authelia-server.conf in the server block)
        include /config/nginx/authelia-location.conf;

        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app paperless-ngx-webserver;
        set $upstream_port 8000;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    }
}
```

Note that the line `server_name paperless-ngx.*;` is the one defining the name of our sub domain which in this case will be `paperless-ngx`. You can totally change that to whatever you prefer, could be `paperless` or `documents` for example. Just remember to update our environment variable `PAPERLESS_URL` in our `docker-compose.yaml` accordingly.

Once this file is added, we're pretty much done already! All we've got to do now is to restart SWAG so that it takes it into consideration.

Open up the URL https://paperless-ngx.yourdomain.duckdns.org and 🥁...

![Authelia login page](./assets/authelia-login-page.png 'Authelia login page')

This is because we've made sure above to uncomment the 2 lines

```
# enable for Authelia (requires authelia-location.conf in the location block)
include /config/nginx/authelia-server.conf;
```

and

```
# enable for Authelia (requires authelia-server.conf in the server block)
include /config/nginx/authelia-location.conf;
```

But once we authenticate:

![Paperless-ngx landing page](./assets/paperless-ngx-landing-page.png 'Paperless-ngx landing page')

We've got our app running 🎉!

Log in with the user you created earlier and:

![Paperless-ngx landing page once logged in](./assets/paperless-ngx-landing-page-once-logged-in.png 'Paperless-ngx landing page once logged in')

You can now enjoy your Paperless-ngx instance and start uploading your documents! While it uploads and before you start organizing them, I'd definitely recommend to read the [best practices](https://docs.paperless-ngx.com/usage/#basic-searching) guide from the official documentation.

# Conclusion

Adding a new service is as simple as finding the Docker Compose configuration, often offered by the project you're trying to run, in their documentation and adding one NGINX config file in SWAG to expose it, safely behind your 2FA security with Authelia.

Happy document triaging!

---

I hope you enjoyed this article, if you did let me know with a reaction and eventually drop a comment. It's always nice to hear back from people who took the time to read a post 😄!

If you're interested in more articles about Angular, RxJS, open source, self hosting, data privacy, feel free to hit the **follow button** for more. Thanks for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| &nbsp;                                                                                                                              | &nbsp;                                                                                                                                           | &nbsp;                                                                                                                                               | &nbsp;                                                                                                                                                    | &nbsp;                                                                                                                                                                | &nbsp;                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) | [![Stackoverflow](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/stackoverflow-logo.png 'Stackoverflow')](https://stackoverflow.com/users/2398593/maxime1992) |
