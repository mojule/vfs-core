'use strict'

const slug = ({ api }) => {
  api.slug = () => api.value.filename
}

module.exports = slug
