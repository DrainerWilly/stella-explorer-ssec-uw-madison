# Helio-STELLA test code i2c_bus_scan

# STELLA bus addresses
# listing available at https://learn.adafruit.com/i2c-addresses/the-list

# 0x36 -- MAX17048 fuel gauge onboard the Thing Plus RP2040 (address collision with rotary encoder)
# 0x3c -- 0.91" OLED display 128x32
# 0x49 -- AS7265x Triad spectrometer sensor
# 0x68 -- PCF8523 real time clock
# 0x6f -- i2c_button

import time
import board
import busio

try:
    i2c = busio.I2C(board.SCL, board.SDA)
    print( "i2c bus initialized" )
except ValueError as err:
    print( "i2c bus fail to initialize, {}".format(err) )

while not i2c.try_lock():
    print( "i2c bus failure" )
    time.sleep(2)

loop_count = 0
while True:
    print("loop count {}".format(loop_count), end=' -- ')
    print("i2c addresses found:", [hex(device_address)
                                   for device_address in i2c.scan()])
    time.sleep(1)
    loop_count += 1



