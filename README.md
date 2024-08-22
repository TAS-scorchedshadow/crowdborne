# Crowdborne - Group Assignment UI

Rough UI to help with assigning groups based on who people want to be with. Designed for specialised use for DevSoc's Training Program.

Does **not** contain an assignment alogrithm

## Build

Build will be created in the **src/target** directory

```sh
npm run tauri build
```

### Running in development mode

```sh
npm run tauri dev
```

## File Format

Columns as follows

```
name
role
lead_preferences (comma seperated list of names)
trainee_preferences (comma seperated list of names)
difficulty (string representing a desired difficulty/goal for a person. Used to highlight people with similar difficulty preferences)
group (assigned group name, defaults to empty string)
[github]
[discord]
[other]

--
[] = optional fields
Trainee and lead preferences are simply 2 different input fields that are merged. If you don't have 2 groups you can simply use one field and leave the other blank
```

Example

```csv
name,role,lead_preferences,trainee_preferences,difficulty,group
a,trainee,"b,c",,easy,"team a"
b,lead,,a,normal,"team b"
v,lead,b,a,arbitrary,"team c"
```
