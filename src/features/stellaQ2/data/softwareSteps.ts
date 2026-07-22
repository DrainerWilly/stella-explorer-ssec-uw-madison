export interface SoftwareStep {
  number: number
  title: string
  exactFileOrDrive?: string
  sourceIds: string[]
}

export const SOFTWARE_STEPS: SoftwareStep[] = [
  { number: 1, title: 'Use short, rounded toothpick rods at the b and r access holes; do not use metal.', sourceIds: ['software-instructions'] },
  { number: 2, title: 'Hold boot, then press and release reset.', sourceIds: ['software-instructions'] },
  { number: 3, title: 'Wait for the boot drive to appear.', exactFileOrDrive: 'RP1-RP2', sourceIds: ['software-instructions'] },
  { number: 4, title: 'Copy the supplied CircuitPython UF2 to RP1-RP2.', exactFileOrDrive: 'adafruit-circuitpython-sparkfun_thing_plus_rp2040-en_US-9.2.8.uf2', sourceIds: ['software-instructions', 'uf2-9-2-8'] },
  { number: 5, title: 'Wait for RP1-RP2 to eject and CIRCUITPY to appear.', exactFileOrDrive: 'CIRCUITPY', sourceIds: ['software-instructions'] },
  { number: 6, title: 'Verify boot_out.txt, lib, code.py, and an empty folder named sd.', exactFileOrDrive: 'boot_out.txt · lib · code.py · sd', sourceIds: ['software-instructions'] },
  { number: 7, title: 'Copy the supplied lib folder and code.py to CIRCUITPY.', exactFileOrDrive: 'Software_3_0_1/lib · Software_3_0_1/code.py', sourceIds: ['software-instructions', 'firmware-3-0-1', 'circuitpython-libraries'] },
  { number: 8, title: 'Choose Replace when the computer reports existing files; do not choose Merge.', sourceIds: ['software-instructions'] },
]

