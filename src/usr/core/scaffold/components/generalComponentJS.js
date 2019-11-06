import path from 'path-browserify';
import template from 'lodash/template';
import { repairPath } from '../../utils/fileUtils';
import { checkFileExists } from '../utils';
import { format } from '../../utils/textUtils';

const templateContent = `
import isEqual from 'lodash/isEqual';
import React from 'react';
import { <%= componentName %>Types } from './<%= componentName %>.props';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  containerStyle: {
    marginTop: '1em',
    marginBottom: '1em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
};

class <%= componentName %> extends React.Component {
  constructor (props) {
    super(props);
    const { inputText, styling } = this.props;
    this.state = {
      prevStyling: styling,
      rootStyle: {...styling, ...styles.root},
      localInputText: inputText || '',
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.styling !== state.prevStyling) {
      const newRootStyle = {...props.styling, ...styles.root};
      if (!isEqual(newRootStyle, state.rootStyle)) {
        return {
          prevStyling: props.styling,
          rootStyle: newRootStyle,
        };
      }
    }
    return null;
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { localInputText, rootStyle } = this.state;
    const { data } = this.props;
    return localInputText !== nextState.localInputText
      || data !== nextProps.data
      || rootStyle !== nextState.rootStyle;
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { inputText } = this.props;
    const { localInputText } = this.state;
    if (inputText !== prevProps.inputText && localInputText !== inputText) {
      this.setState({
        localInputText: inputText || ''
      });
    }
  }

  handleChangeInputValue = (e) => {
    this.setState({
      localInputText: e.target.value,
    });
    this.props.onInputTextChange({
      enteredText: e.target.value
    });
  };

  handleButtonClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onSubmit({
      enteredText: this.state.localInputText,
    });
  };

  render () {
    const { data, cells } = this.props;
    const { rootStyle, localInputText } = this.state;
    return (
      <div style={rootStyle}>
        <h3>{data.title}</h3>
        <div style={styles.containerStyle}>
          <input
            type="text"
            name="inputText"
            id="inputText"
            placeholder={data.placeholder}
            value={localInputText}
            onChange={this.handleChangeInputValue}
          />
        </div>
        <div style={styles.containerStyle}>
          <button onClick={this.handleButtonClick}>
            Click
          </button>
        </div>
        {cells && cells.map((item, itemIdx) => {
          return (
            <div key={itemIdx} style={styles.containerStyle}>
              {item}
            </div>
          );
        })}
      </div>
    );
  }
}

<%= componentName %>.propTypes = <%= componentName %>Types;

<%= componentName %>.defaultProps = {
  styling: {
    padding: '1em',
    margin: '4em',
    borderColor: '#cdcdcd',
    borderWidth: '2px',
    borderStyle: 'dotted'
  },
  data: {
    title: 'Empty Title Value',
    placeholder: 'Enter text',
    inputText: '',
    inputObject: {},
    inputArray: [],
  },
  cells: [
    (<div>Placeholder</div>)
  ],
  onInputTextChange: () => {
    console.info('<%= componentName %>.onInputTextChange is not set');
  },
  onSubmit: () => {
    console.info('<%= componentName %>.onSubmit is not set');
  },
};

export default <%= componentName %>;
`;

const templateContentProps = `
import PropTypes from 'prop-types';

export const <%= componentName %>Types = {
  // CSS properties
  styling: PropTypes.shape({
    // The border-color shorthand CSS property sets the color of an element's border.
    borderColor: PropTypes.string,
    // The border-width shorthand CSS property sets the width of an element's border.
    borderWidth: PropTypes.string,
    // The border-style shorthand CSS property sets the line style for all four sides of an element's border.
    borderStyle: PropTypes.oneOf([
      'none',
      'hidden',
      'dotted',
      'dashed',
      'solid',
      'double',
      'groove',
      'ridge',
      'inset',
      'outset',
      'inherit',
      'initial'
    ]),
    // An element's padding area is the space between its content and its border.
    padding: PropTypes.string,
    // The margin CSS property sets the margin area on all four sides of an element.
    margin: PropTypes.string,
  }),
  // Used for passing data in the component
  data: PropTypes.shape({
    // Component title value
    title: PropTypes.string,
    // Placeholder text in the input element
    placeholder: PropTypes.string,
    // Text value in the input element
    inputText: PropTypes.string,
    // Input arbitrary object
    inputObject: PropTypes.object,
    // Input arbitrary array
    inputArray: PropTypes.array,
  }),
  /*
   *  An array of the placeholders for child components.
   *  Increase array size to put more items.
   */
  cells: PropTypes.arrayOf(PropTypes.element),
  /* 
   * Triggered when the text is changed in the input control
   *
   * @param {<%= componentName %>InputTextTypes}
   */
  onInputTextChange: PropTypes.func,
  /*
   * Submits the entered value
   *
   * @param {<%= componentName %>SubmitTypes}
   */
  onSubmit: PropTypes.func,
};

export const <%= componentName %>InputTextTypes = {
  // changed text in the input control
  enteredText: PropTypes.string,
};

export const <%= componentName %>SubmitTypes = {
  // entered text into the input control
  enteredText: PropTypes.string,
};
`;

const templateContentReadme = `
### <%= componentName %>

It's a template for a new React component.

> Find in the source code the properties of the component written in the correct format for Webcodesk. 
> Add comments to the properties if you want to see hints in the properties editor of the component.

#### Properties

*Inputs*
* __styling__ - _{Object}_ CSS properties
    * __borderColor__ - _{string}_ The border-color shorthand CSS property sets the color of an element's border.
    * __borderWidth__ - _{string}_ The border-width shorthand CSS property sets the width of an element's border.
    * __borderStyle__ - _{string}_ The border-style shorthand CSS property sets the line style for all four sides of an element's border.
    * __padding__ - _{string}_ An element's padding area is the space between its content and its border.
    * __margin__ - _{string}_ The margin CSS property sets the margin area on all four sides of an element.
* __data__ - _{Object}_ Used for passing data in the component
    * __title__ - _{string}_ Component title value
    * __placeholder__ - _{string}_ Placeholder text in the input element
    * __inputText__ - _{string}_ Text value in the input element
* __cells__ - _{array}_ The placeholders for child components. Increase array size to put more items.

*Outputs*

* __onInputTextChange__ - _{function}_ Triggered when the text is changed in the input control.
    * _output data format_  \`{ enteredText: "value" }\`
* __onSubmit__ - _{function}_ Triggered when the user clicks on the button control, and submits the entered value.
    * _output data format_  \`{ enteredText: "value" }\`

#### Files

* \`<%= componentName %>.comp.js\` - the source code of the component.
* \`<%= componentName %>.props.js\` - the source code of the PropTypes definitions.
* \`<%= componentName %>.md\` - the source of the current file

> Don't remove the suffix before file extensions (\`*.comp.js\`, \`*.props.js\`)
`;

export async function createFiles (componentName, dirName, destDirPath, fileExtension) {
  const fileObjects = [];
  let fileExists;
  const componentFilePath = repairPath(path.join(destDirPath, dirName, `${componentName}.comp${fileExtension}`));
  fileExists = await checkFileExists(componentFilePath);
  if (fileExists) {
    throw Error(`The file with the "${componentName}.comp${fileExtension}" name already exists.`);
  }
  const propsFilePath = repairPath(path.join(destDirPath, dirName, `${componentName}.props${fileExtension}`));
  fileExists = await checkFileExists(propsFilePath);
  if (fileExists) {
    throw Error(`The file with the "${componentName}.props${fileExtension}" name already exists.`);
  }
  const readmeFilePath = repairPath(path.join(destDirPath, dirName, `${componentName}.md`));
  fileExists = await checkFileExists(readmeFilePath);
  if (fileExists) {
    throw Error(`The file with the "${componentName}.md" name already exists.`);
  }
  fileObjects.push({
    filePath: componentFilePath,
    fileData: format(template(templateContent)({
      componentName
    }))
  });
  fileObjects.push({
    filePath: propsFilePath,
    fileData: format(template(templateContentProps)({
      componentName
    }))
  });
  fileObjects.push({
    filePath: readmeFilePath,
    fileData: template(templateContentReadme)({
      componentName
    })
  });
  return fileObjects;

}