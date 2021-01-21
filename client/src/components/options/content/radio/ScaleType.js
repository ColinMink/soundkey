import React, { Component } from 'react';
import './styles.css'

import Radio from './index'

  class ScaleTypeRadio extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const title = "Scale Type";
        const options = [
            {
                html: <>5</>,
                value: "Pentatonic"
            },
            {
                html: <>6</>,
                value: "Hexatonic"
            },
            {
                html: <>7</>,
                value: "Heptatonic"
            },
            {
                html: <>8</>,
                value: "Octatonic"
            },
            {
                html: <>12</>,
                value: "Dodecatonic"
            },
        ];
        const defaultValue = "Heptatonic";

        return (
            <Radio title={title} options={options} defaultValue={defaultValue} />
        );
    }
}
  
  export default ScaleTypeRadio;