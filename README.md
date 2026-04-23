# Jet Lag The Game: Montreal Hide and Seek Map Generator

A custom-built tool for generating interactive maps for the Island of Montreal, designed for Jet Lag The Game's Hide and Seek. The map is pre-configured with Montreal-specific data including borough boundaries, metro lines, and local landmarks (parks, hospitals, universities, airports).

## Question Types

### Radius

- Inside/outside a given distance of a point
- Supports miles, kilometers, and meters

### Thermometer

- Closer to point A or point B (warmer/colder)

### Tentacles

- McDonald's — nearest McDonald's within a radius
- Libraries — nearest library within a radius

### Matching

Matching questions compare properties of the hider's location against a reference point. The answer is either "Same" or "Different", and the map territory is carved accordingly:

- **District** — Same or different Montreal borough. Uses local borough boundary data to include or exclude the matching district.
- **Airport** — Same or different nearest commercial airport (Trudeau vs Metropolitan). Uses Voronoi cells to determine catchment areas.
- **Metro Line** — Same or different metro line (Green, Orange, Yellow, Blue, or REM). A dropdown selects the line. "Same" excludes 300m territory around all stations on other lines; "Different" excludes territory around stations on the selected line.
- **Park** — Same or different nearest park. A dropdown selects a specific park by name. Uses Voronoi cells computed from all parks on the Island of Montreal.
- **Hospital** — Same or different nearest hospital. A dropdown selects a specific hospital by name. Uses Voronoi cells computed from all hospitals.
- **University** — Same or different nearest university. A dropdown selects a specific university by name. Uses Voronoi cells computed from all universities.

For Park, Hospital, and University questions: if the answer is "Same", only the selected landmark's Voronoi cell remains on the map; if "Different", that cell is excluded. You can also click a landmark pin on the map and select "Add Matching" to automatically create a pre-configured matching question.

## Map Features

- **Pre-loaded Island of Montreal** as the default play area
- **Landmark pins** displayed on the map for parks (green), hospitals (red), universities (purple), and airports (black)
- **Popup menus** on landmark pins for quick question creation
- **Metro line and station overlays** for visual reference
- **Custom polygon drawing** for fine-tuning boundaries
- **Hider Mode** — automatically answers all questions based on the hider's location
- **URL sharing** — embed entire game state in a shareable link

## Contributing

This project has evolved significantly from a generic global tool into a Montreal-specific Hide and Seek map generator. Contributions are very much welcome — whether it's adding new Montreal-specific question types, improving landmark data, refactoring code, or fixing bugs. If you find a bug, please either file an issue or create a pull request. Some suggestions:

- [ ] Adding more Montreal-specific questions (new landmark types, STM bus routes, BIXI stations, etc.)
- [ ] Improving landmark data accuracy in `final_landmarks.geojson`
- [ ] Refactoring code
- [ ] Tests
- [ ] Custom question presets

Even if you're not a programmer, you can still help by verifying landmark locations and reporting inaccurate data.

## Developer Workflow

To develop this website, you need to have [git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/) (version 24 or earlier), and [pnpm](https://pnpm.io/installation) installed. You should then start by cloning this repository and entering the directory:

```bash
git clone https://github.com/taibeled/JetLagHideAndSeek.git
cd JetLagHideAndSeek
```

Next, use `pnpm` to install the dependencies:

```bash
pnpm install
```

You can now host the website as you make modifications:

```bash
pnpm dev
```

After making any modifications, please run `pnpm lint` to have your code automatically formatted and errors spotted.

## Contributors

A great deal of appreciation goes out to these individuals who have helped to create this tool:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/taibeled"><img src="https://avatars.githubusercontent.com/u/179261820?v=4?s=100" width="100px;" alt="taibeled"/><br /><sub><b>taibeled</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3Ataibeled" title="Bug reports">🐛</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=taibeled" title="Code">💻</a> <a href="#design-taibeled" title="Design">🎨</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=taibeled" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/vdumestre"><img src="https://avatars.githubusercontent.com/u/33914769?v=4?s=100" width="100px;" alt="vdumestre"/><br /><sub><b>vdumestre</b></sub></a><br /><a href="#ideas-vdumestre" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MrYawnie"><img src="https://avatars.githubusercontent.com/u/14262612?v=4?s=100" width="100px;" alt="Jani Andsten"/><br /><sub><b>Jani Andsten</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=MrYawnie" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bradleyrosenfeld.com/"><img src="https://avatars.githubusercontent.com/u/938452?v=4?s=100" width="100px;" alt="ʙʀᴀᴅʟᴇʏ ʀᴏsᴇɴғᴇʟᴅ"/><br /><sub><b>ʙʀᴀᴅʟᴇʏ ʀᴏsᴇɴғᴇʟᴅ</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=BoringCode" title="Code">💻</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3ABoringCode" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/abrahamguo"><img src="https://avatars.githubusercontent.com/u/7842684?v=4?s=100" width="100px;" alt="Abraham Guo"/><br /><sub><b>Abraham Guo</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=abrahamguo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://zusor.io/"><img src="https://avatars.githubusercontent.com/u/23165606?v=4?s=100" width="100px;" alt="Tobias Messner"/><br /><sub><b>Tobias Messner</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=zusorio" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/UnknownSilicon"><img src="https://avatars.githubusercontent.com/u/14339279?v=4?s=100" width="100px;" alt="Eris"/><br /><sub><b>Eris</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=UnknownSilicon" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/khiral"><img src="https://avatars.githubusercontent.com/u/23667350?v=4?s=100" width="100px;" alt="khiral"/><br /><sub><b>khiral</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=khiral" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hanneshier"><img src="https://avatars.githubusercontent.com/u/11063798?v=4?s=100" width="100px;" alt="hanneshier"/><br /><sub><b>hanneshier</b></sub></a><br /><a href="#ideas-hanneshier" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/blahajjessie"><img src="https://avatars.githubusercontent.com/u/78718906?v=4?s=100" width="100px;" alt="blahajjessie"/><br /><sub><b>blahajjessie</b></sub></a><br /><a href="#ideas-blahajjessie" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bagottgames.uk/"><img src="https://avatars.githubusercontent.com/u/88278955?v=4?s=100" width="100px;" alt="Bla0"/><br /><sub><b>Bla0</b></sub></a><br /><a href="#ideas-Blaa00" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://herzog.tech/"><img src="https://avatars.githubusercontent.com/u/5376265?v=4?s=100" width="100px;" alt="Leo"/><br /><sub><b>Leo</b></sub></a><br /><a href="#ideas-leoherzog" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Acclamator"><img src="https://avatars.githubusercontent.com/u/4201849?v=4?s=100" width="100px;" alt="Acclamator"/><br /><sub><b>Acclamator</b></sub></a><br /><a href="#ideas-Acclamator" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/selacey42"><img src="https://avatars.githubusercontent.com/u/200851729?v=4?s=100" width="100px;" alt="selacey42"/><br /><sub><b>selacey42</b></sub></a><br /><a href="#ideas-selacey42" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3Aselacey42" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/asemaca"><img src="https://avatars.githubusercontent.com/u/64056714?v=4?s=100" width="100px;" alt="asemaca"/><br /><sub><b>asemaca</b></sub></a><br /><a href="#ideas-asemaca" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3Aasemaca" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Akiva-Cohen"><img src="https://avatars.githubusercontent.com/u/150308530?v=4?s=100" width="100px;" alt="Akiva Cohen"/><br /><sub><b>Akiva Cohen</b></sub></a><br /><a href="#ideas-Akiva-Cohen" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3AAkiva-Cohen" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ChrisHartman"><img src="https://avatars.githubusercontent.com/u/9095854?v=4?s=100" width="100px;" alt="Christopher Robert Hartman"/><br /><sub><b>Christopher Robert Hartman</b></sub></a><br /><a href="#ideas-ChrisHartman" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/miniBill"><img src="https://avatars.githubusercontent.com/u/191825?v=4?s=100" width="100px;" alt="Leonardo Taglialegne"/><br /><sub><b>Leonardo Taglialegne</b></sub></a><br /><a href="#ideas-miniBill" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JackSouster"><img src="https://avatars.githubusercontent.com/u/96268675?v=4?s=100" width="100px;" alt="JackSouster"/><br /><sub><b>JackSouster</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3AJackSouster" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fkloft"><img src="https://avatars.githubusercontent.com/u/2741656?v=4?s=100" width="100px;" alt="fkloft"/><br /><sub><b>fkloft</b></sub></a><br /><a href="#ideas-fkloft" title="Ideas, Planning, & Feedback">🤔</a> <a href="#data-fkloft" title="Data">🔣</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/InvestigateXM"><img src="https://avatars.githubusercontent.com/u/52758500?v=4?s=100" width="100px;" alt="InvestigateXM"/><br /><sub><b>InvestigateXM</b></sub></a><br /><a href="#ideas-InvestigateXM" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Hawkguye"><img src="https://avatars.githubusercontent.com/u/121480806?v=4?s=100" width="100px;" alt="Hawkguye"/><br /><sub><b>Hawkguye</b></sub></a><br /><a href="#data-Hawkguye" title="Data">🔣</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jlewis1778"><img src="https://avatars.githubusercontent.com/u/22303191?v=4?s=100" width="100px;" alt="jlewis1778"/><br /><sub><b>jlewis1778</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=jlewis1778" title="Code">💻</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3Ajlewis1778" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Bert-Moors"><img src="https://avatars.githubusercontent.com/u/89836592?v=4?s=100" width="100px;" alt="Bert-Moors"/><br /><sub><b>Bert-Moors</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=Bert-Moors" title="Code">💻</a> <a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3ABert-Moors" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/azyritedev"><img src="https://avatars.githubusercontent.com/u/206858676?v=4?s=100" width="100px;" alt="azyrite"/><br /><sub><b>azyrite</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=azyritedev" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://metamoof.net/"><img src="https://avatars.githubusercontent.com/u/805751?v=4?s=100" width="100px;" alt="Giles Antonio Radford"/><br /><sub><b>Giles Antonio Radford</b></sub></a><br /><a href="#ideas-metamoof" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/madjayem"><img src="https://avatars.githubusercontent.com/u/71520186?v=4?s=100" width="100px;" alt="madjayem"/><br /><sub><b>madjayem</b></sub></a><br /><a href="#ideas-madjayem" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/palimer6"><img src="https://avatars.githubusercontent.com/u/26436548?v=4?s=100" width="100px;" alt="palimer6"/><br /><sub><b>palimer6</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3Apalimer6" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fahmisack"><img src="https://avatars.githubusercontent.com/u/241826952?v=4?s=100" width="100px;" alt="fahmisack"/><br /><sub><b>fahmisack</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3Afahmisack" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://matchatea.dev"><img src="https://avatars.githubusercontent.com/u/46655509?v=4?s=100" width="100px;" alt="Issac Liu"/><br /><sub><b>Issac Liu</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/issues?q=author%3ACamuise" title="Bug reports">🐛</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KyleRosenberg"><img src="https://avatars.githubusercontent.com/u/5465361?v=4?s=100" width="100px;" alt="Kyle"/><br /><sub><b>Kyle</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=KyleRosenberg" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/MoellJ"><img src="https://avatars.githubusercontent.com/u/42173084?v=4?s=100" width="100px;" alt="Jannik Möll"/><br /><sub><b>Jannik Möll</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=MoellJ" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Dew2118"><img src="https://avatars.githubusercontent.com/u/50415635?v=4?s=100" width="100px;" alt="Dew2118"/><br /><sub><b>Dew2118</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=Dew2118" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://mkuran.pl"><img src="https://avatars.githubusercontent.com/u/16469272?v=4?s=100" width="100px;" alt="Mikołaj Kuranowski"/><br /><sub><b>Mikołaj Kuranowski</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=MKuranowski" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://brasswillow.pl"><img src="https://avatars.githubusercontent.com/u/1677760?v=4?s=100" width="100px;" alt="Marek Hobler"/><br /><sub><b>Marek Hobler</b></sub></a><br /><a href="#ideas-neutrinus" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://rso.pt"><img src="https://avatars.githubusercontent.com/u/56204853?v=4?s=100" width="100px;" alt="Rafael Oliveira"/><br /><sub><b>Rafael Oliveira</b></sub></a><br /><a href="https://github.com/taibeled/JetLagHideAndSeek/commits?author=RafDevX" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
