# jupyterlab_retrieve_base_url

[![Github Actions Status](https://github.com/mthiboust/jupyterlab-retrieve-base-url/workflows/Build/badge.svg)](https://github.com/mthiboust/jupyterlab-retrieve-base-url/actions/workflows/build.yml)

A JupyterLab extension to retrieve the base URL from the frontend. It was developped as a workaround for current limitation of `dash` jupyterlab extension that cannot be installed with jupyterlab v4.

## Install

Note that this extension requires `jupyterLab>=4.0.0`.

To install/uninstall the extension, execute:

```bash
# Install
pip install jupyterlab_retrieve_base_url

# Uninstall
pip uninstall jupyterlab_retrieve_base_url
```

## Usage

In a jupyterlab notebook:
```python
from jupyterlab_retrieve_base_url import retrieve_base_url

retrieve_base_url()
```

Some typical results:
```python
# Running locally
{'type': 'base_url_response',
 'server_url': 'http://localhost:8890',
 'base_subpath': '/',
 'frontend': 'jupyterlab'}
 ```

```python
# Using jupyterhub
{'type': 'base_url_response',
 'server_url': 'https://my-domain.com',
 'base_subpath': '/user/user@my-domain.com/',
 'frontend': 'jupyterlab'}
```

### Configure dash proxy config

The current `jupyter_dash.infer_jupyterlab_proxy_config()` method from the `dash==2.18.1` library is not working correctly with `jupyterlab>=4.0.0` (see https://github.com/plotly/dash/issues/2804 and https://github.com/plotly/dash/issues/2998). If you run into this issue, then you can try the following:

```python
from dash import Dash, jupyter_dash

# Set proxy settings
from dash._jupyter import _jupyter_config
from jupyterlab_retrieve_base_url import retrieve_base_url
_jupyter_config.update(retrieve_base_url())

# Create a dash app
app = dash.Dash()
...

# Run the dash app
jupyter_dash.run_app(app, host=host, port=port, mode="jupyterlab")
```
