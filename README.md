# GDonkey Extension Debugger

An extension that logs web traffic to help debug the main GDonkey extension.

It logs:

- HTTP requests
- WebSocket messages

## Getting Started

Clone into this repository:

```
git clone https://github.com/tgiardina/gdonkey-debugger.git
cd gdonkey-debugger
```

Install and build the extension:

```
npm i
npm run build
```

Start the extension in it's own Firefox window:

```
npm start
```

This new window will open with a single tab inspecting this extension. Click `Console` to see the log messages. You should see:

```
>> Successfully loaded!
>> Open a new tab to start sniffing traffic.
```

Open a new tab and navigate to a site. Any HTTP request or WS message sent by this site will now be logged.

## Filter the logging

If the console is printing too many logs, you can filter them. Start by copying over the example `.env`

```
cp .env.example .env
```

and then using your favorite editor, set the env variables as desired:

- `SRC_URLS` - The webpages whose traffic you want to sniff.
   - Takes a list of glob strings.
   - An unset `SRC_URLS` is equivalent to `["*"]`
   - `[]` is equivalent to `["*"]`
- `TARGET_URLS` - The API endpoints you want to sniff.
    - Takes a list of glob strings.
   - An unset `TARGET_URLS` is equivalent to `["*"]`
   - `[]` is equivalent to `["*"]`
- `PROTOCOL` - The type of traffic you want to sniff
   - Either `http`, `ws`, or `any`.
   - An unset ` PROTOCOL` is equivalent to `any`.

