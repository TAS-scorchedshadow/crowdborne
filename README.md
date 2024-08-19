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

```csv
name,role,lead_preferences,trainee_preferences,difficulty,github,discord,group
a,trainee,"b,c",,easy,example,example,0
b,lead,,a,normal,example,example,0
v,lead,b,a,arbitrary,example,example,0
```

Both lead preferences and trainee preference fields should be a list of comma seperated identifiers
