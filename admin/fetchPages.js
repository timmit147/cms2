name: FunHelloJob

on: [push]

jobs:
  hello_job:
    runs-on: ubuntu-latest

    steps:
    - name: Display Hello 3 Times
      run: |
        for i in 1 2 3; do
          echo "Hello $i"
        done
