## test
### testing

bobos: the clown

```mermaid
sequenceDiagram
    participant b as Browser
    participant s as SvelteBackend
    participant f as Firebase
    participant a as API

    b-->>s: read
    s-->>b: display login page
    b-->>f: authenticate
    f-->>b: id token
    b-->>s: validate
    s-->>f: 



```

