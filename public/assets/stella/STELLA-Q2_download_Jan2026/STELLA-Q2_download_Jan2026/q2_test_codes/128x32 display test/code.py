from board import SCL, SDA
import busio
import displayio
import time
from adafruit_display_text import label
import terminalio
import adafruit_displayio_ssd1306

def main():
    try:
        i2c_bus = busio.I2C(SCL, SDA)
        display, display_group = initialize_display( i2c_bus )
        display.root_group = display_group
        text_group = displayio.Group(scale=2, x=10, y=20)
        text = "STELLA"
        text_area = label.Label(terminalio.FONT, text=text, color=0xFFFFFF)
        text_group.append(text_area) # Subgroup for text scaling
        display_group.append(text_group)

        count_group = displayio.Group(scale=2, x=100, y=20)
        text = "0"
        count_area = label.Label(terminalio.FONT, text=text, color=0xFFFFFF)
        count_group.append(count_area) # Subgroup for text scaling
        display_group.append(count_group)

        loop_count = 0
        while loop_count < 10:
            print( "loop count == {}".format( loop_count ))
            count_area.text = str( loop_count )
            loop_count += 1
            time.sleep( 1.0 )

    finally:  # clean up the busses when ctrl-c'ing out of the loop
        displayio.release_displays()
        print( "displayio displays released" )
        i2c_bus.deinit()
        print( "i2c_bus deinitialized" )

def initialize_display( i2c_bus ):
    try:
        display_bus = displayio.I2CDisplay( i2c_bus, device_address=0x3c )
        display = adafruit_displayio_ssd1306.SSD1306( display_bus, width=128, height=32 )
        display_group = displayio.Group()
        print( "initialized display" )
    except ValueError:
        display = False
        display_group = False
    return display, display_group

main()
