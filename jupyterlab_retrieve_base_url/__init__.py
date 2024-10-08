try:
    from ._version import __version__
except ImportError:
    # Fallback when using the package in dev mode without installing
    # in editable mode with pip. It is highly recommended to install
    # the package from a stable release or in editable mode: https://pip.pypa.io/en/stable/topics/local-project-installs/#editable-installs
    import warnings

    warnings.warn("Importing 'jupyterlab_retrieve_base_url' outside a proper installation.")
    __version__ = "dev"


def _jupyter_labextension_paths():
    return [{"src": "labextension", "dest": "jupyterlab-retrieve-base-url"}]


def retrieve_base_url(timeout=2):
    import asyncio

    import IPython
    import nest_asyncio
    from comm import create_comm
    from ipykernel.comm import Comm

    create_comm = Comm
    _jupyterlab_comm = create_comm(target_name="retrieve_base_url")

    _jupyter_config = {}
    _caller = {}

    shell = IPython.get_ipython()
    kernel = shell.kernel

    _caller["parent"] = _jupyterlab_comm.kernel.get_parent()

    @_jupyterlab_comm.on_msg
    def _receive_message(msg):
        prev_parent = _caller.get("parent")
        if prev_parent and prev_parent != _jupyterlab_comm.kernel.get_parent():
            _jupyterlab_comm.kernel.set_parent([prev_parent["header"]["session"]], prev_parent)
            del _caller["parent"]

        msg_data = msg.get("content").get("data")
        msg_type = msg_data.get("type", None)
        if msg_type == "base_url_response":
            _jupyter_config.update(msg_data)

    _jupyterlab_comm.send({"type": "base_url_request"})

    async def wait_for_message(timeout=timeout):
        for _ in range(int(timeout * 10)):  # Checks every 0.1 seconds
            loop = asyncio.get_event_loop()
            nest_asyncio.apply(loop)
            loop.run_until_complete(kernel.do_one_iteration())

            if _jupyter_config:  # Check if _jupyter_config has been updated
                break
            await asyncio.sleep(0.1)

    def run_async_task():
        loop = asyncio.get_event_loop()
        nest_asyncio.apply(loop)
        return loop.run_until_complete(wait_for_message(timeout=timeout))

    # Run the asynchronous wait
    run_async_task()

    return _jupyter_config
