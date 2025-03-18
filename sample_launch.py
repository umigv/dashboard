from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import LogInfo, TimerAction

def generate_launch_description():
    return LaunchDescription([
        # Print a message to the console
        LogInfo(msg='Hello from ROS2 launch file!'),
        
        # Add a short timer and then exit
        TimerAction(
            period=2.0,  # Wait for 2 seconds
            actions=[
                LogInfo(msg='Launch file completed, exiting now.')
            ]
        )
    ])