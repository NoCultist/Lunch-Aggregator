# 🍱 Lunch Aggregator

A simple, cross-platform tool to collect and organise lunch data from multiple sources — ideal for workplaces, canteens, or foodies who like everything in one place.

# 🚀 What It Is

Lunch Aggregator is a full-stack project that pulls together lunch information from different feeds/APIs and presents it through a web interface and/or API. Designed with simplicity and extensibility in mind, it’s written in:
- TypeScript, React — Frontend/UI logic
- C# (.NET) — Backend server and API
- CSS — Basic styling layer

# 🧩 Features

Right now this project is minimal, but its goals are:
- 🥗 Aggregate lunch menus from multiple sources or endpoints
- 📡 Serve a centralised API for clients to consume
- 🖥️ Client UI to browse and filter lunch options
- 🧠 Easy to extend with new data sources or UI components

# 🧠 Architecture Overview
+-------------------+        +---------------------+
|  lunchaggregator. | <====> |  LunchAggregator.   |
|     client        |        |      Server         |
+-------------------+        +---------------------+
        Frontend                  Backend API

- Server: Handles fetching and normalising lunch feeds.
- Client: UI layer presenting menus and options.

# 🛠️ Getting Started
## Requirements
Ensure you have the following installed:
- .NET SDK (for backend)
- Node.js + npm/yarn (for frontend)

## Run Locally
Clone the repo:
```
git clone https://github.com/NoCultist/Lunch-Aggregator.git
cd Lunch-Aggregator
```

## Backend
```
cd LunchAggregator.Server
dotnet restore
dotnet run
```

## Frontend
```
cd lunchaggregator.client
npm install
npm start
```

App should be available on:
```
https://localhost:3000
```

## Acknowledgement
Project was developed with use of GitHub Copilot.
