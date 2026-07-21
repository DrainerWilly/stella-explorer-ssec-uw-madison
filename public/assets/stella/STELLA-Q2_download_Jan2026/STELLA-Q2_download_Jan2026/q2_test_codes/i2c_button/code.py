import time
import board
import busio
from i2c_button import I2C_Button

try:
    i2c_bus = board.I2C()
    print( "i2c_bus initialized" )
except:
    print( "i2c bus failed to initialize" )
    i2c_bus = False

if i2c_bus:
    try:
        button = I2C_Button( i2c_bus )
        print( "button initialized" )
        print("firmware version", button.version)
        print("debounce ms", button.debounce_ms)
    except:
        button = False
        print( "button failed to initialize" )

if button:
    button.led_bright = 1
    recording_mode = 0
    recording_number_of_modes = 2
    last_clicked = False
    is_pressed = False
    last_pressed = False
    button.clear()
    loop_count = 0

    while True:
        #print( "loop_count", loop_count )
        button_values = button.status

        if recording_mode == 0:
            button.led_bright = 1
        if recording_mode == 1:
            button.led_bright = 128

        if button_values[ 2 ]:
            print( "button is pressed" )
            is_pressed = True
            if last_pressed:
                recording_mode = (recording_mode + 1) % recording_number_of_modes
                last_pressed = False
            else:
                last_pressed = True
        else:
            is_pressed = False


        if button_values[ 1 ]:
            clicked = True
            print( "button is clicked" )
        else:
            clicked = False

        button.clear()
        time.sleep(0.1)


        loop_count += 1
