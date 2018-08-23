import React from "react";
import {Progress} from "antd";

class MyProgress extends React.Component {
    render() {
        console.log(this.props);
        return <Progress percent={this.props.progress} />;
    }
}

export default MyProgress;
