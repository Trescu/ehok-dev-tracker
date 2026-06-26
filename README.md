# eHÖK Dev Tracker v7

Lokálisan futó fejlesztői tracker eHÖK arculattal, CSV import/export támogatással.

## Fő változások

- Nincsenek előre betöltött sprintek, feladatok, mérföldkövek vagy jegyzetek.
- Részletesebb CSV export/import.
- Sticky bal oldali sidebar desktopon.
- Sticky oldalfejléc.
- Javított feladatkártya-layout: a leírás nem nyújtja meg a jobb oldali gombokat.
- Javított modal bezáró gomb.
- A modal és sidebar görgetősávjai rejtve vannak.
- Lenyitható sprintkártyák.

## Használat

Nyisd meg az `index.html` fájlt böngészőben, vagy tedd ki GitHub Pages-re.

## Adattárolás

Az adatok a böngésző LocalStorage tárhelyén maradnak. CSV export/import használható mentéshez vagy előre generált adatok betöltéséhez.

## CSV mezők

`type;id;code;title;description;status;priority;area;sprintId;sprintCode;startDate;endDate;dueDate;estimateHours;tags;notes;body;createdAt;updatedAt`

Típusok:
- `sprint`
- `task`
- `milestone`
- `note`


## v7.3

- Fixed sidebar brand wordmark to use a dedicated white eHÖK asset.


## v7.4

- Final sidebar brand fix: the original transparent eHÖK wordmark is used and inverted to white on the blue sidebar.
