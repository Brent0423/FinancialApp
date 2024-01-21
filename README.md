# My Finance App

## Introduction

**My Finance App** is a Python-based web application that helps analyze financial data. It allows users to input stock symbols and time frames to access and analyze relevant financial information. This app is useful for both financial enthusiasts and professionals who want to track and analyze stock market trends.

## Prerequisites

To use this app, you need to have the following:

- **Docker**: This is used to run the app in containers.
- **Docker Compose**: This tool helps manage multi-container Docker applications.

## Installation and Setup

Follow these steps to install and set up the app:

1. **Clone the Repository**

   Start by copying the app's code to your computer using Git:

   ```bash
   git clone git@github.com:Brent0423/FinancialApp.git
   cd FinancialApp
   ```

2. **Launch the Application**

   Use Docker Compose to run the app. Once it's running, you can access it at `http://localhost:5001`.

   ```bash
   docker-compose up
   ```

## Usage

To use the app, follow these steps:

1. **Fetching Data**: Enter a stock symbol and a time frame in the app's user-friendly interface. The app will retrieve and display relevant financial data, giving you insights into stock performance and trends.

## Financial Calculations Explained

### Annual Return Rate %

- **Formula**: Compound Annual Growth Rate (CAGR)
- **Calculation**: `((ending_price / beginning_price) ** (1 / actual_years)) - 1`
- **Parameters**:
  - **ending_price**: The last closing price of the stock.
  - **beginning_price**: The initial closing price of the stock.
  - **actual_years**: The number of years the stock has been traded.

This formula helps determine the average annual growth rate of an investment over a specific period.

### Real Rate %

- **Formula**: Adjusts the annual return for inflation.
- **Calculation**: `((1 + nominal_return) / (1 + inflation_rate)) - 1`
- **Parameters**:
  - **nominal_return**: The annual return rate.
  - **inflation_rate**: The anticipated inflation rate.

This calculation shows the real value of an investment, considering the impact of inflation.

### Confidence Interval

- **Formula**: Estimates the likely range of a population parameter.
- **Calculation**: `(mean - 1.96 * (std_dev / sqrt(len(first_prices))), mean + 1.96 * (std_dev / sqrt(len(first_prices))))`
- **Parameters**:
  - **mean**: The average of the first prices of each month.
  - **std_dev**: The standard deviation of the first prices.
  - **len(first_prices)**: The count of the first prices.

A 95% confidence interval is determined using a z-score of 1.96. The interval is based on the closing price of the stock on the first trading day of each month, calculated using `first_prices = closing_prices.resample('M').first()`.

## Project Structure

The project consists of the following files and folders:

- `app.py`: This file is the core of the application and is responsible for running the web server.
- `fetch_data.py`: This file contains the `StockDataFetcher` class, which is used to retrieve data.
- `docker-compose.yaml`: This file is used to configure Docker Compose.
- `Dockerfile`: This file defines the Docker image.
- `requirements.txt`: This file lists the Python dependencies.
- `static/`: This folder contains static assets like CSS and JavaScript.
- `templates/`: This folder holds HTML templates for the user interface.
