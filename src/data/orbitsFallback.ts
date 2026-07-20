// @ts-nocheck
// Development fallback data. Not guaranteed current.
//
// These two-line elements (TLEs) were retrieved from CelesTrak (2026-07-02 /
// 2026-07-03) and committed so Mission Control still works when CelesTrak is
// unreachable and no local/in-memory cache exists. Orbits drift over time, so
// positions computed from this fallback grow less accurate the further the
// simulation time is from each element's epoch. The orbit service always
// prefers fresh data and clearly labels responses served from this file as
// "fallback".
//
// Entries are keyed by ORBITAL OBJECT (NORAD catalog number), not by mission,
// several catalog missions are instruments hosted on a shared object (e.g. the
// ISS), so they reuse the same object here.

export const FALLBACK_RETRIEVED_AT = '2026-07-03T00:00:00.000Z'
export const FALLBACK_SOURCE_URL = 'https://celestrak.org/NORAD/elements/gp.php'

export const FALLBACK_TLES = [
  {
    objectName: 'LANDSAT 8',
    noradCatalogNumber: 39084,
    tleLine1: '1 39084U 13008A   26183.26949805  .00000382  00000+0  94892-4 0  9997',
    tleLine2: '2 39084  98.2297 253.2253 0001354  93.4323 266.7030 14.57104791700091',
  },
  {
    objectName: 'LANDSAT 9',
    noradCatalogNumber: 49260,
    tleLine1: '1 49260U 21088A   26183.16657736  .00000404  00000+0  99710-4 0  9998',
    tleLine2: '2 49260  98.2276 253.1624 0001186  87.7763 272.3572 14.57107719253183',
  },
  {
    objectName: 'TERRA',
    noradCatalogNumber: 25994,
    tleLine1: '1 25994U 99068A   26183.22300821  .00000467  00000+0  10391-3 0  9992',
    tleLine2: '2 25994  97.9448 232.1726 0002722 149.3750 284.6419 14.61115325411804',
  },
  {
    objectName: 'AQUA',
    noradCatalogNumber: 27424,
    tleLine1: '1 27424U 02022A   26183.25579660  .00000893  00000+0  18730-3 0  9996',
    tleLine2: '2 27424  98.4285 152.8404 0000695  80.3205  32.0215 14.62181352285471',
  },
  {
    objectName: 'AURA',
    noradCatalogNumber: 28376,
    tleLine1: '1 28376U 04026A   26183.25510905  .00000895  00000+0  19081-3 0  9998',
    tleLine2: '2 28376  98.3424 139.8338 0001184  86.5053 273.6283 14.61352181168417',
  },
  {
    objectName: 'GPM-CORE',
    noradCatalogNumber: 39574,
    tleLine1: '1 39574U 14009C   26183.29418786  .00011665  00000+0  25143-3 0  9993',
    tleLine2: '2 39574  64.9712 257.5214 0011264 257.7133 102.2747 15.44885986700140',
  },
  {
    objectName: 'ICESAT-2',
    noradCatalogNumber: 43613,
    tleLine1: '1 43613U 18070A   26183.28061912  .00010933  00000+0  39651-3 0  9994',
    tleLine2: '2 43613  92.0094 295.0572 0006143  85.7552 274.4400 15.28296948434768',
  },
  {
    objectName: 'SMAP',
    noradCatalogNumber: 40376,
    tleLine1: '1 40376U 15003A   26183.25937861  .00000507  00000+0  10713-3 0  9996',
    tleLine2: '2 40376  98.1277 190.1404 0001474  97.3987 262.7383 14.63380140609820',
  },
  {
    objectName: 'SWOT',
    noradCatalogNumber: 54754,
    tleLine1: '1 54754U 22173A   26183.20800918  .00000102  00000+0  71014-4 0  9997',
    tleLine2: '2 54754  77.6102  15.0315 0000321  87.5523 272.5665 14.00171342181254',
  },
  {
    objectName: 'PACE',
    noradCatalogNumber: 58928,
    tleLine1: '1 58928U 24025A   26183.28444898  .00000482  00000+0  97556-4 0  9991',
    tleLine2: '2 58928  98.0951 114.3780 0001667 163.8606 196.2651 14.65557330128145',
  },
  {
    objectName: 'SUOMI NPP',
    noradCatalogNumber: 37849,
    tleLine1: '1 37849U 11061A   26183.28357443  .00000081  00000+0  59478-4 0  9991',
    tleLine2: '2 37849  98.7955 124.0566 0000705 312.3554  47.7562 14.19520479760584',
  },
  {
    objectName: 'NOAA 20 (JPSS-1)',
    noradCatalogNumber: 43013,
    tleLine1: '1 43013U 17073A   26183.29686510  .00000075  00000+0  56528-4 0  9997',
    tleLine2: '2 43013  98.7773 122.6253 0000866 132.4393 227.6856 14.19514503446610',
  },
  {
    objectName: 'SENTINEL-6A',
    noradCatalogNumber: 46984,
    tleLine1: '1 46984U 20086A   26183.15413938 -.00000048  00000+0  54852-4 0  9991',
    tleLine2: '2 46984  66.0412 103.9669 0007838 270.0176  89.9941 12.80929970262248',
  },
  {
    objectName: 'ISS (ZARYA)',
    noradCatalogNumber: 25544,
    tleLine1: '1 25544U 98067A   26182.50817465  .00006185  00000+0  11827-3 0  9996',
    tleLine2: '2 25544  51.6311 229.1989 0004224 255.0896 104.9625 15.49503254573972',
  },
  {
    objectName: 'GRACE-FO 1',
    noradCatalogNumber: 43476,
    tleLine1: '1 43476U 18047A   26183.83836154  .00004754  00000+0  12457-3 0  9993',
    tleLine2: '2 43476  88.9911 195.8012 0013231  58.9335 301.3217 15.38369082452206',
  },
  {
    objectName: 'JASON-3',
    noradCatalogNumber: 41240,
    tleLine1: '1 41240U 16002A   26183.84742051 -.00000035  00000+0  10633-3 0  9995',
    tleLine2: '2 41240  66.0417  92.9125 0008309 271.8737  88.1330 12.87623298489260',
  },
  {
    objectName: 'NISAR',
    noradCatalogNumber: 65053,
    tleLine1: '1 65053U 25163A   26183.77195132  .00000232  00000+0  83074-4 0  9993',
    tleLine2: '2 65053  98.4056  11.2093 0001222  88.7062 271.4268 14.42504821 48639',
  },
  {
    objectName: 'NOAA 21 (JPSS-2)',
    noradCatalogNumber: 54234,
    tleLine1: '1 54234U 22150A   26183.82276674  .00000058  00000+0  47932-4 0  9991',
    tleLine2: '2 54234  98.7060 122.3492 0002467 126.4917 233.6487 14.19539315188766',
  },
  {
    objectName: 'OCO 2',
    noradCatalogNumber: 40059,
    tleLine1: '1 40059U 14035A   26183.81208002  .00000486  00000+0  11787-3 0  9996',
    tleLine2: '2 40059  98.2019 124.8673 0001489  82.0449 278.0919 14.57124289638320',
  },
  {
    objectName: 'PREFIRE-1',
    noradCatalogNumber: 59965,
    tleLine1: '1 59965U 24108A   26183.69810427  .00007160  00000+0  30010-3 0  9996',
    tleLine2: '2 59965  97.5334 338.5641 0011420 178.9848 181.1414 15.23772240114953',
  },
  {
    objectName: 'PREFIRE-2',
    noradCatalogNumber: 59881,
    tleLine1: '1 59881U 24099A   26183.85170045  .00004469  00000+0  20318-3 0  9994',
    tleLine2: '2 59881  97.4066  39.7867 0012936 144.5983 215.6114 15.21176960116512',
  },
  {
    objectName: 'SENTINEL-6B',
    noradCatalogNumber: 66514,
    tleLine1: '1 66514U 25264A   26183.85717080 -.00000046  00000+0  64349-4 0  9997',
    tleLine2: '2 66514  66.0412 102.6328 0007916 268.8819  91.1289 12.80929974 29170',
  },
  {
    objectName: 'INTELSAT 40E (IS-40E)',
    noradCatalogNumber: 56174,
    tleLine1: '1 56174U 23052A   26183.63583328 -.00000164  00000+0  00000+0 0  9993',
    tleLine2: '2 56174   0.0178  62.3025 0002446  68.3711 287.9007  1.00272139 11977',
  },
  {
    objectName: 'CYGFM01',
    noradCatalogNumber: 41887,
    tleLine1: '1 41887U 16078D   26183.61367890  .00025659  00000+0  32997-3 0  9999',
    tleLine2: '2 41887  34.9387 159.3160 0007978 279.6825  80.2998 15.58029354531118',
  },
  {
    objectName: 'CYGFM02',
    noradCatalogNumber: 41886,
    tleLine1: '1 41886U 16078C   26183.84296227  .00041508  00000+0  39734-3 0  9995',
    tleLine2: '2 41886  34.9400 117.8213 0007402 325.5178  34.5068 15.65546274531624',
  },
  {
    objectName: 'CYGFM03',
    noradCatalogNumber: 41891,
    tleLine1: '1 41891U 16078H   26183.85925427  .00034547  00000+0  39723-3 0  9996',
    tleLine2: '2 41891  34.9396 127.1049 0006872 310.3425  49.6700 15.60926669531425',
  },
  {
    objectName: 'CYGFM04',
    noradCatalogNumber: 41885,
    tleLine1: '1 41885U 16078B   26183.87301262  .00035933  00000+0  39010-3 0  9995',
    tleLine2: '2 41885  34.9318 123.5523 0006484 322.0141  38.0127 15.62401888531454',
  },
  {
    objectName: 'CYGFM05',
    noradCatalogNumber: 41884,
    tleLine1: '1 41884U 16078A   26183.63181250  .00025116  00000+0  33165-3 0  9998',
    tleLine2: '2 41884  34.9557 158.2652 0008068 285.0788  74.9044 15.57329564531160',
  },
  {
    objectName: 'CYGFM07',
    noradCatalogNumber: 41890,
    tleLine1: '1 41890U 16078G   26183.24860683  .00031773  00000+0  36586-3 0  9992',
    tleLine2: '2 41890  34.9439 129.2429 0007032 318.0003  42.0183 15.60901001531350',
  },
  {
    objectName: 'CYGFM08',
    noradCatalogNumber: 41888,
    tleLine1: '1 41888U 16078E   26183.29040917  .00031616  00000+0  36529-3 0  9997',
    tleLine2: '2 41888  34.9423 140.6357 0008715 306.3717  53.6204 15.60797506531331',
  },
  {
    objectName: 'GRACE-FO 2',
    noradCatalogNumber: 43477,
    tleLine1: '1 43477U 18047B   26183.83863663  .00004816  00000+0  12621-3 0  9991',
    tleLine2: '2 43477  88.9910 195.8011 0013242  58.9829 301.2725 15.38366927452203',
  },
]
