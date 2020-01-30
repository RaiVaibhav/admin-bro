import React, { ReactNode, MouseEvent } from 'react'
import { flatten, unflatten } from 'flat'

import PropertyInEdit from '../../ui/property-in-edit'
import Column from '../../ui/column'
import Columns from '../../ui/columns'
import convertParamsToArrayItems from './convert-params-to-array-items'
import StyledSection from '../../ui/styled-section'
import PropertyJSON from '../../../../backend/decorators/property-json.interface'
import RecordJSON from '../../../../backend/decorators/record-json.interface'
import updateParamsArray from './update-params-array'
import { Button } from '../../design-system'

const normalizeParams = (params: RecordJSON['params']): RecordJSON['params'] => (
  flatten<string, any>(unflatten(params, { overwrite: true }))
)

type Props = {
  property: PropertyJSON;
  record: RecordJSON;
  onChange: (record: RecordJSON) => any;
  ItemComponent: typeof React.Component;
}

export default class Edit extends React.Component<Props> {
  constructor(props) {
    super(props)
    this.addNew = this.addNew.bind(this)
  }

  addNew(event: MouseEvent): false {
    const { property, record, onChange } = this.props
    const items = convertParamsToArrayItems(property, record)
    const newRecord = { ...record }
    newRecord.params = normalizeParams({
      ...newRecord.params, // otherwise yarn types is not working
      [property.name]: [
        ...items,
        property.subProperties.length ? {} : '',
      ],
    })
    onChange(newRecord)
    event.preventDefault()
    return false
  }

  removeItem(i, event: MouseEvent): false {
    const { property, record, onChange } = this.props
    const items = convertParamsToArrayItems(property, record)
    const newItems = [...items]
    newItems.splice(i, 1)
    const newRecord = { ...record }

    newRecord.params = updateParamsArray(
      newRecord.params, property.name, newItems,
    )

    onChange(newRecord)
    event.preventDefault()
    return false
  }

  renderItem(item, i): ReactNode {
    const { ItemComponent, property } = this.props
    return (
      <Columns key={i}>
        <Column width={10}>
          <ItemComponent
            {...this.props}
            property={{
              ...property,
              name: `${property.name}.${i}`,
              label: `[${i + 1}]`,
              isArray: false,
            }}
          />
        </Column>
        <Column width={2}>
          <Button
            type="button"
            style={{ marginTop: 25 }}
            onClick={(event): false => this.removeItem(i, event)}
          >
            Remove
          </Button>
        </Column>
      </Columns>
    )
  }

  renderInput(): ReactNode {
    const { property, record } = this.props
    const items = convertParamsToArrayItems(property, record)
    return (
      <StyledSection style={{ marginTop: 20 }}>
        {items.map((item, i) => this.renderItem(item, i))}
        <p>
          <Button onClick={this.addNew} type="button">
            Add new item
          </Button>
        </p>
      </StyledSection>
    )
  }

  render(): ReactNode {
    const { property, record } = this.props
    const error = record.errors && record.errors[property.name]
    return (
      <PropertyInEdit property={property} error={error}>
        {this.renderInput()}
      </PropertyInEdit>
    )
  }
}
