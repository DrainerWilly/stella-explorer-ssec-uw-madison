import time
import board
import digitalio

onboard_LED = digitalio.DigitalInOut( board.LED )
onboard_LED.direction = digitalio.Direction.OUTPUT
loop_count = 0
while True:
    print("loop count {}".format(loop_count))
    onboard_LED.value = True
    time.sleep( 1 )
    onboard_LED.value = False
    time.sleep( 1 )
    loop_count += 1
