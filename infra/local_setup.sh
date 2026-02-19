#!/bin/bash
install_mac_brew() {
  printf " installing brew...\n"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  printf " - brew: OK\n"
}

install_mac_gcloud() {
  if which brew; then
    printf " - brew: OK\n"
  else
    install_mac_brew
  fi
  printf " installing gcloud...\n"
  brew install --cask google-cloud-sdk
  printf " - gcloud: OK\n"
}

install_linux_gcloud() {
  printf " installing gcloud...\n"
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
  sudo apt-get install apt-transport-https ca-certificates gnupg
  curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
  sudo apt-get update && sudo apt-get install google-cloud-sdk
  printf " - gcloud: OK\n"
}

install_windows_gcloud() {
  printf " opening gcloud installation instructions...\n"
  open https://cloud.google.com/sdk/docs/install#windows
  exit 0
}

if [ "${CI:-}" != "" ]; then
  printf "detected that we're running in CI\n"
  if [ "${CI}" == "cloudbuild" ]; then
    printf "google cloud build: - OK\n"
    exit 0;
  fi
  if [ -z "${Q_NPM_READ_ACCESS}" ]; then
    printf "could not find Env var '%s'" "Q_NPM_READ_ACCESS"
    exit 1;
  fi
  printf "setting Google application credentials\n"
  echo "${Q_NPM_READ_ACCESS}" | base64 -d > ./npm_read.json;
  exit 0;
fi

# Actual execution
printf "checking if gcloud is installed...\n"
if which gcloud; then
  printf " - gcloud: OK\n"
else
  case "${OSTYPE}" in
    "linux-gnu"*)
      install_linux_gcloud
    ;;
    "darwin"*)
      install_mac_gcloud
    ;;
    "msys")
      install_windows_gcloud
    ;;
    *)
      printf "The automation script does not support operating system '%s' yet, please check in with DevOps\n" "${OSTYPE}"
      printf " opening gcloud installation instructions...\n"
      open https://cloud.google.com/sdk/docs/install
    ;;
  esac
fi

# count the number of active accounts
if [ "${OSTYPE}" == "msys" ]; then
  ACTIVE_ACCOUNTS=$(gcloud auth list --format="value(account)" | find /c /v "")
else
  ACTIVE_ACCOUNTS=$(gcloud auth list --format="value(account)" | wc -l)
fi

# And make sure the user is logged in, or trigger gcloud init
if [ "${ACTIVE_ACCOUNTS}" -ge 1 ]; then
  printf "Already logged in\n";
else
  gcloud auth login
fi
