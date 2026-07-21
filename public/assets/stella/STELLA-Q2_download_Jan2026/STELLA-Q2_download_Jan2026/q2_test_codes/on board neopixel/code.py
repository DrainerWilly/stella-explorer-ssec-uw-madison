import time
import board
import neopixel

pixel_pin = board.NEOPIXEL
number_of_pixels = 1

ORDER = neopixel.GRB

pixels = neopixel.NeoPixel( pixel_pin, number_of_pixels, brightness=0.2, auto_write=False, pixel_order=ORDER )


loop_count = 0
while True:
    print( "loop count {}".format(loop_count))
    pixels.fill((255, 0, 0))
    pixels.show()
    time.sleep(1)

    pixels.fill((0, 255, 0))
    pixels.show()
    time.sleep(1)

    pixels.fill((0, 0, 255))
    pixels.show()
    time.sleep(1)

    loop_count += 1
