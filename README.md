
**Notes on JSON requests**

- If no `.<format>` is specified in the request URL, response format will be dicatated by:
  - Presence/absence of Accept header
  - If no Accept header, ordering of formats in call to respond_to
    in receipts_controller.rb (if both :json and :html are present)

**TODO**

- break into partials/custom directives
- if email address gets changed, reflect in the session/dropdown
- input validation

**Curl commands for testing**

GET

```
curl -i \
     -H "Accept:application/json" \
     localhost:3000/receipts\?api_token="..." \
     > response.json && open response.json
```

POST (see test/data.json)

```
curl -i \
     -H "Content-Type:application/json" \
     -H "Accept:application/json" \
     -d @data.json \
     localhost:3000/receipts\?api_token="..." \
     > response.json && open response.json
```


