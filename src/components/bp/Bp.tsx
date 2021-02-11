import React from "react";

const Bp = () => {

    return (
    <div>
        {/* Change library version here to match current NPM version */}
        <script lang="javascript" src="https://cdn.jsdelivr.net/npm/buttplug@1.0.1/dist/web/buttplug.min.js">
        </script>

        { Buttplug.buttplugInit().then(() => console.log("Library loaded")) };
      
    </div>
    );

}