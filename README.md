# xyt-order-book-data-tool mini project
![image](https://github.com/user-attachments/assets/f2213d34-fd68-44df-993d-8d2912ea5865)

This project is an Angular-based interactive data visualization tool that displays trading order book information from a JSON file. It allows users to view snapshots of the order book at different timestamps, navigate through time, and watch an animated replay of the order book's evolution.

The visualization is built using Chart.js, and the UI is styled with Tailwind CSS.


## Replay Feature Showcase

[Watch the replay feature in action!](https://youtu.be/Ge8yi3SzBX8)

## Features

*   **View Snapshot**: Displays the bid (buy) and ask (sell) levels of an order book for a selected moment in time.
*   **Time Navigation**:
    *   Select a specific timestamp from a dropdown list.
    *   Navigate to the previous or next available snapshot.
*   **Replay Mode**:
    *   Animates the progression through all available order book snapshots.
    *   The entire dataset is replayed over a user-configurable fixed period (e.g., 30 seconds).
    *   The relative time intervals (proportions) between snapshots are preserved during the replay.
*   **Responsive Design**: The UI adapts to different screen sizes.
*   **Fixed Chart Scale**: The order size (X-axis) on the chart has a fixed scale from -150,000 to +150,000 for consistent visualization across snapshots.

## Technologies Used

*   **Angular (v17+ recommended, non-standalone components)**
*   **TypeScript**
*   **RxJS** for reactive programming
*   **Chart.js** for charting
*   **Tailwind CSS** for styling
*   **HTML5 & CSS**

## Setup and Installation

1.  **Prerequisites**:
    *   Node.js (v18.x or v20.x recommended)
    *   Angular CLI: `npm install -g @angular/cli`

2.  **Clone the repository (or create the project and copy files):**
    ```bash
    git clone xyt-data-tool
    cd xyt-data-tool
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Data File**:
    Ensure the `data.json` file containing the order book snapshots is placed in the `src/assets/` directory. The format should match the example provided during development.


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.1.
