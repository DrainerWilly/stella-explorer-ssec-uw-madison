import board
import storage
import time
import digitalio
import busio
import sdcardio

cs = board.SD_CS
sd_card_spi = busio.SPI(board.SD_SCK, MOSI=board.SD_MOSI, MISO=board.SD_MISO)
sdcard = sdcardio.SDCard(sd_card_spi, cs)
vfs = storage.VfsFat(sdcard)
print( "sdcardio success" )

storage.mount(vfs, "/sd")

loop_count = 0
while loop_count < 4:
    print("loop count {}".format(loop_count))
    #time.sleep(0.1)
    with open( "/sd/test.txt", "w" ) as f:
        f.write( "year, month, day, batch\n" )
        f.write( "2022, 12, 30, 0\n" )


    with open("/sd/test.txt", "r") as f:
        print("Printing lines in file:")
        #print()
        line = f.readline()
        while line != '':
            print(line)
            line = f.readline()
    #print()
    loop_count += 1
    time.sleep(1)
print( "Program Completed" )
