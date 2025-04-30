<div align="center">
  <div>
    <img src=".github/screenshot.png" alt="AI Commits"/>
    <h1 align="center">AI Commits</h1>
  </div>
	<p>A CLI that writes your git commit messages for you with AI. Never write a commit message again.</p>
	<a href="https://www.npmjs.com/package/elminson-aicommits"><img src="https://img.shields.io/npm/v/elminson-aicommits" alt="Current version"></a>
</div>

---

## Setup

> The minimum supported version of Node.js is the latest v14. Check your Node.js version with `node --version`.

1. Install _aicommits_:

    ```sh
    npm install -g elminson-aicommits
    ```

2. Choose and configure your AI provider:

    ### OpenAI (Default)
    1. Retrieve your API key from [OpenAI](https://platform.openai.com/account/api-keys)
    2. Set the key:
        ```sh
        aicommits config set OPENAI_KEY=<your token>
        ```

    ### DeepSeek
    1. Retrieve your API key from [DeepSeek](https://platform.deepseek.com/)
    2. Configure DeepSeek:
        ```sh
        aicommits config set AI_PROVIDER=deepseek
        aicommits config set DEEPSEEK_KEY=<your token>
        ```

    ### Ollama (Local)
    1. Install and start [Ollama](https://ollama.ai/)
    2. Configure Ollama:
        ```sh
        aicommits config set AI_PROVIDER=ollama
        # Optional: Set custom Ollama endpoint if not running locally
        aicommits config set OLLAMA_BASE_URL=http://your-ollama-server:11434
        ```

This will create a `.aicommits` file in your home directory.

### Upgrading

Check the installed version with:
```
aicommits --version
```

If it's not the [latest version](https://github.com/Nutlope/aicommits/releases/latest), run:

```sh
npm update -g aicommits
```

## Usage
### CLI mode

You can call `aicommits` directly to generate a commit message for your staged changes:

```sh
git add <files...>
aicommits
```

`aicommits` passes down unknown flags to `git commit`, so you can pass in [`commit` flags](https://git-scm.com/docs/git-commit).

For example, you can stage all changes in tracked files with as you commit:
```sh
aicommits --all # or -a
```

> 👉 **Tip:** Use the `aic` alias if `aicommits` is too long for you.

#### Generate multiple recommendations

Sometimes the recommended commit message isn't the best so you want it to generate a few to pick from. You can generate multiple commit messages at once by passing in the `--generate <i>` flag, where 'i' is the number of generated messages:
```sh
aicommits --generate <i> # or -g <i>
```

> Warning: this uses more tokens, meaning it costs more.

#### Generating Conventional Commits

If you'd like to generate [Conventional Commits](https://conventionalcommits.org/), you can use the `--type` flag followed by `conventional`. This will prompt `aicommits` to format the commit message according to the Conventional Commits specification:

```sh
aicommits --type conventional # or -t conventional
```

This feature can be useful if your project follows the Conventional Commits standard or if you're using tools that rely on this commit format.

### Git hook

You can also integrate _aicommits_ with Git via the [`prepare-commit-msg`](https://git-scm.com/docs/githooks#_prepare_commit_msg) hook. This lets you use Git like you normally would, and edit the commit message before committing.

#### Install

In the Git repository you want to install the hook in:
```sh
aicommits hook install
```

#### Uninstall
In the Git repository you want to uninstall the hook from:

```sh
aicommits hook uninstall
```

#### Usage

1. Stage your files and commit:
    ```sh
    git add <files...>
    git commit # Only generates a message when it's not passed in
    ```

    > If you ever want to write your own message instead of generating one, you can simply pass one in: `git commit -m "My message"`

2. Aicommits will generate the commit message for you and pass it back to Git. Git will open it with the [configured editor](https://docs.github.com/en/get-started/getting-started-with-git/associating-text-editors-with-git) for you to review/edit it.

3. Save and close the editor to commit!

## Configuration

### Reading a configuration value
To retrieve a configuration option, use the command:

```sh
aicommits config get <key>
```

For example, to retrieve the API key, you can use:
```sh
aicommits config get OPENAI_KEY
```

You can also retrieve multiple configuration options at once by separating them with spaces:

```sh
aicommits config get OPENAI_KEY generate
```

### Setting a configuration value

To set a configuration option, use the command:

```sh
aicommits config set <key>=<value>
```

For example, to set the API key, you can use:

```sh
aicommits config set OPENAI_KEY=<your-api-key>
```

You can also set multiple configuration options at once by separating them with spaces, like

```sh
aicommits config set OPENAI_KEY=<your-api-key> generate=3 locale=en
```

### Options
#### AI_PROVIDER

Default: `openai`

The AI provider to use for generating commit messages. Available options:
- `openai`: Uses OpenAI's GPT models (requires `OPENAI_KEY`)
- `deepseek`: Uses DeepSeek's models (requires `DEEPSEEK_KEY`)
- `ollama`: Uses locally running Ollama models (requires Ollama to be running)

To change the provider:
```sh
aicommits config set AI_PROVIDER=deepseek
```

#### OPENAI_KEY

Optional (Required when using `AI_PROVIDER=openai`)

The OpenAI API key. You can retrieve it from [OpenAI API Keys page](https://platform.openai.com/account/api-keys).

#### DEEPSEEK_KEY

Optional (Required when using `AI_PROVIDER=deepseek`)

The DeepSeek API key. You can retrieve it from [DeepSeek's platform](https://platform.deepseek.com/).

#### OLLAMA_BASE_URL

Optional (Used when `AI_PROVIDER=ollama`)

Default: `http://localhost:11434`

The URL where your Ollama instance is running. You only need to set this if you're running Ollama on a different host or port.

Example:
```sh
aicommits config set OLLAMA_BASE_URL=http://my-ollama-server:11434
```

#### locale
Default: `en`

The locale to use for the generated commit messages. Consult the list of codes in: https://wikipedia.org/wiki/List_of_ISO_639-1_codes.

#### generate

Default: `1`

The number of commit messages to generate to pick from.

Note, this will use more tokens as it generates more results.

#### proxy

Set a HTTP/HTTPS proxy to use for requests.

To clear the proxy option, you can use the command (note the empty value after the equals sign):

```sh
aicommits config set proxy=
```

#### model

Default: `gpt-3.5-turbo`

The model to use for generating commit messages. The available models depend on your chosen AI provider:

##### OpenAI
Any Chat Completions (`/v1/chat/completions`) model. Consult the list of models available in the [OpenAI Documentation](https://platform.openai.com/docs/models/model-endpoint-compatibility).

> Tip: If you have access, try upgrading to [`gpt-4`](https://platform.openai.com/docs/models/gpt-4) for next-level code analysis. It can handle double the input size, but comes at a higher cost.

##### DeepSeek
DeepSeek's chat models, such as:
- `deepseek-chat-1.3b`
- `deepseek-coder-6.7b`
- `deepseek-coder-33b`

##### Ollama
Any model you have pulled locally with Ollama, such as:
- `codellama`
- `deepseek-coder`
- `mistral`
- `llama2`

Example:
```sh
# For OpenAI
aicommits config set model=gpt-4

# For DeepSeek
aicommits config set model=deepseek-coder-33b

# For Ollama
aicommits config set model=codellama
```

#### timeout
The timeout for network requests to the OpenAI API in milliseconds.

Default: `10000` (10 seconds)

```sh
aicommits config set timeout=20000 # 20s
```

#### max-length
The maximum character length of the generated commit message.

Default: `50`

```sh
aicommits config set max-length=100
```

#### type

Default: `""` (Empty string)

The type of commit message to generate. Set this to "conventional" to generate commit messages that follow the Conventional Commits specification:

```sh
aicommits config set type=conventional
```

You can clear this option by setting it to an empty string:

```sh
aicommits config set type=
```

#### auto-push-current-branch

Default: `false`

Automatically push the commit to the current branch without prompting the user.

```sh
aicommits config set auto-push-current-branch=true
```

#### ask-push-current-branch

Default: `false`

Ask to push the commit to the current branch prompting the user.

```sh
aicommits config set ask-push-current-branch=true
```

## How it works

This CLI tool runs `git diff` to grab all your latest code changes, sends them to OpenAI's GPT-3, then returns the AI generated commit message.

Video coming soon where I rebuild it from scratch to show you how to easily build your own CLI tools powered by AI.

## Maintainers

- **Elminson De Oleo Baez**: [@elminson](https://github.com/elminson) [<img src="https://img.shields.io/twitter/follow/elminson?style=flat&label=elminson&logo=twitter&color=0bf&logoColor=fff" align="center">](https://twitter.com/elminson)

## Original Maintainers

- **Hassan El Mghari**: [@Nutlope](https://github.com/Nutlope) [<img src="https://img.shields.io/twitter/follow/nutlope?style=flat&label=nutlope&logo=twitter&color=0bf&logoColor=fff" align="center">](https://twitter.com/nutlope)


- **Hiroki Osame**: [@privatenumber](https://github.com/privatenumber) [<img src="https://img.shields.io/twitter/follow/privatenumbr?style=flat&label=privatenumbr&logo=twitter&color=0bf&logoColor=fff" align="center">](https://twitter.com/privatenumbr)


## Contributing

If you want to help fix a bug or implement a feature in [Issues](https://github.com/elminson/elminson-aicommits/issues), checkout the [Contribution Guide](CONTRIBUTING.md) to learn how to setup and test the project.
