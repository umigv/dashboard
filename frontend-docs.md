# Frontend Documentation

## Connection Status
- Visual indicators for connection state

## Main Dashboard
The interface is divided into three main panels:

### 1. Control Panel
- **Status Indicator**
  - Color-coded status dot showing robot's operational state
  - Text display showing current status ("Ready to Run", "Running", "Paused", or "Emergency Stop")

- **Controller Mode Selection**
  - Multiple operation modes available:
    - Disabled
    - Autonomous
    - Teleop
    - Qualification
    - Simulation
  - Active mode is highlighted

- **Emergency Controls**
  - Prominent emergency stop button that immediately halts all robot operations
  - Sets controller mode to "Disabled" when activated

### 2. Path Visualization Panel
- **Real-time Path Display**
  - Visual representation of robot's current position
  - Robot marker that updates position and rotation in real-time

- **Hardware Information Display**
  - **Speedometer**
    - Current robot speed in km/h
  
  - **IMU Data**
    - Roll measurement (degrees)
    - Pitch measurement (degrees)
    - Yaw measurement (degrees)
  
  - **GPS Location**
    - Latitude (degrees North)
    - Longitude (degrees West)
    - Altitude (meters)

### 3. Camera Feed Panel
- **Live Video Feed**
  - Real-time camera stream from the robot

- **Camera Controls**
  - **Brightness Adjustment**
    - Slider control (range 0-8)
    - Numerical display of current brightness value
  
  - **Contrast Adjustment**
    - Slider control (range 0-8)
    - Numerical display of current contrast value

## Socket Communication

The interface uses Socket.io for real-time bidirectional communication between the client and server:

### Incoming Events (Server to Client)
- **`robotStatus`**: Updates about operational status (running state, mode, emergency status)
- **`sensorData`**: Periodic sensor information (IMU and GPS readings)
- **`positionUpdate`**: Real-time position data (coordinates, rotation, speed)

### Outgoing Events (Client to Server)
- **`cameraSettings`**: Camera adjustment parameters (brightness, contrast)
- **`setMode`**: Changes operational mode (disabled, autonomous, teleop, etc.)
- **`emergencyStop`**: Triggers emergency stop procedure
- **`getInitialState`**: Requests initial robot state on page load

## Technical Implementation
- Uses Socket.io for real-time bidirectional communication
- Sends and receives data including:
  - Robot status updates
  - Sensor data
  - Position updates
  - Camera setting adjustments
- HTTP requests to control robot mode changes
- Auto-initializes by requesting robot state on page load